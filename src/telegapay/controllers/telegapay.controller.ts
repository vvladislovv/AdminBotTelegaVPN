import { Controller, Post, Body, ValidationPipe, HttpCode, HttpStatus, UsePipes, Headers, UseFilters } from '@nestjs/common';
import { TelegapayService } from '../services/telegapay.service';
import { GetMethodsDto, GetRequisitesDto, CreatePaylinkDto, CheckStatusDto, ConfirmPaymentDto, CreatePayoutDto, CancelPaymentDto, CancelPayoutDto, SendReceiptDto, TelegapayWebhookDto, ValidatePaymentMethodDto } from '../dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { TelegapayExceptionFilter } from '../filters/telegapay-exception.filter';
import { TelegapayValidationPipe } from '../pipes/telegapay-validation.pipe';

@ApiTags('Telegapay')
@Controller('telegapay')
@UseFilters(TelegapayExceptionFilter)
export class TelegapayController {
  constructor(private readonly telegapayService: TelegapayService) {}

  @Post('get-methods')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Получить доступные методы оплаты Telegapay' })
  @ApiResponse({ status: 200, description: 'Список доступных методов оплаты.'})
  @ApiResponse({ status: 400, description: 'Ошибка валидации входных данных.' })
  @ApiResponse({ status: 500, description: 'Внутренняя ошибка сервера.' })
  async getPaymentMethods(@Body(new TelegapayValidationPipe()) getMethodsDto: GetMethodsDto) {
    return this.telegapayService.getPaymentMethods(getMethodsDto);
  }

  @Post('get-requisites')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Получить реквизиты для метода оплаты Telegapay' })
  @ApiResponse({ status: 200, description: 'Реквизиты для метода оплаты.'})
  @ApiResponse({ status: 400, description: 'Ошибка валидации входных данных.' })
  @ApiResponse({ status: 500, description: 'Внутренняя ошибка сервера.' })
  async getRequisites(@Body(new TelegapayValidationPipe()) getRequisitesDto: GetRequisitesDto) {
    return this.telegapayService.getRequisites(getRequisitesDto);
  }

  @Post('validate-payment-method')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Проверить доступность метода оплаты' })
  @ApiBody({ type: ValidatePaymentMethodDto })
  @ApiResponse({ status: 200, description: 'Метод оплаты проверен.' })
  @ApiResponse({ status: 400, description: 'Метод оплаты недоступен или ошибка валидации.' })
  @ApiResponse({ status: 500, description: 'Внутренняя ошибка сервера.' })
  async validatePaymentMethod(@Body(new TelegapayValidationPipe()) dto: ValidatePaymentMethodDto) {
    try {
      // Get available methods
      const methodsResponse = await this.telegapayService.getPaymentMethods({ 
        amount: dto.amount, 
        currency: dto.currency 
      });
      
      const availableMethods = methodsResponse.data?.methods || [];
      const isMethodAvailable = availableMethods.some((method: any) => 
        method.method === dto.payment_method || method.id === dto.payment_method
      );
      
      if (!isMethodAvailable) {
        return {
          success: false,
          message: `Payment method ${dto.payment_method} is not available`,
          available_methods: availableMethods.map((m: any) => m.method || m.id)
        };
      }
      
      // Check requisites with all required fields
      const requisitesResponse = await this.telegapayService.getRequisites({ 
        method: dto.payment_method,
        amount: dto.amount,
        currency: dto.currency,
        order_id: `validate_${Date.now()}`,
        user_id: 'validation_user'
      });
      const hasRequisites = requisitesResponse.data?.requisites && requisitesResponse.data.requisites.length > 0;
      
      return {
        success: true,
        message: 'Payment method is available',
        method_available: true,
        requisites_available: hasRequisites,
        requisites_count: requisitesResponse.data?.requisites?.length || 0
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
        method_available: false,
        requisites_available: false
      };
    }
  }

  @Post('create-paylink')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Создать ссылку на оплату Telegapay' })
  @ApiBody({ type: CreatePaylinkDto })
  @ApiResponse({ status: 201, description: 'Ссылка на оплату успешно создана.' })
  @ApiResponse({ status: 400, description: 'Ошибка валидации входных данных.' })
  @ApiResponse({ status: 404, description: 'Пользователь не найден (если userId указан и невалиден).' })
  @ApiResponse({ status: 500, description: 'Внутренняя ошибка сервера.' })
  async createPaylink(@Body(new TelegapayValidationPipe()) dto: CreatePaylinkDto) {
    return this.telegapayService.createPaylink(dto);
  }

  @Post('check-status')
  @ApiOperation({ summary: 'Проверить статус платежа в Telegapay' })
  @ApiBody({ type: CheckStatusDto })
  @ApiResponse({ status: 200, description: 'Статус платежа успешно проверен.' })
  @ApiResponse({ status: 400, description: 'Неверные входные данные.' })
  @ApiResponse({ status: 404, description: 'Платеж не найден.' })
  @ApiResponse({ status: 500, description: 'Внутренняя ошибка сервера.' })
  async checkPaymentStatus(@Body(new TelegapayValidationPipe()) dto: CheckStatusDto) {
    return this.telegapayService.checkPaymentStatus(dto);
  }

  @Post('confirm-payment')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Подтвердить платеж со стороны покупателя в Telegapay' })
  @ApiBody({ type: ConfirmPaymentDto })
  @ApiResponse({ status: 200, description: 'Платеж успешно подтвержден в Telegapay.' })
  @ApiResponse({ status: 400, description: 'Неверные входные данные.' })
  @ApiResponse({ status: 404, description: 'Платеж (PAYIN) с указанным externalId не найден.' })
  @ApiResponse({ status: 500, description: 'Внутренняя ошибка сервера.' })
  async confirmPayment(@Body(new TelegapayValidationPipe()) dto: ConfirmPaymentDto) {
    return this.telegapayService.confirmPayment(dto);
  }

  @Post('create-payout')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Создать выплату через Telegapay' })
  @ApiBody({ type: CreatePayoutDto })
  @ApiResponse({ status: 201, description: 'Запрос на выплату успешно создан и отправлен в Telegapay.' })
  @ApiResponse({ status: 400, description: 'Неверные входные данные.' })
  @ApiResponse({ status: 500, description: 'Внутренняя ошибка сервера.' })
  async createPayout(@Body(new TelegapayValidationPipe()) dto: CreatePayoutDto) {
    return this.telegapayService.createPayout(dto);
  }

  @Post('cancel-payment')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Отменить платеж в Telegapay' })
  @ApiBody({ type: CancelPaymentDto })
  @ApiResponse({ status: 200, description: 'Платеж успешно отменен.' })
  @ApiResponse({ status: 400, description: 'Неверные входные данные.' })
  @ApiResponse({ status: 404, description: 'Платеж не найден или не может быть отменен.' })
  @ApiResponse({ status: 500, description: 'Внутренняя ошибка сервера.' })
  async cancelPayment(@Body(new TelegapayValidationPipe()) dto: CancelPaymentDto) {
    return this.telegapayService.cancelPayment(dto);
  }

  @Post('cancel-payout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Отменить выплату в Telegapay' })
  @ApiBody({ type: CancelPayoutDto })
  @ApiResponse({ status: 200, description: 'Выплата успешно отменена.' })
  @ApiResponse({ status: 400, description: 'Неверные входные данные.' })
  @ApiResponse({ status: 404, description: 'Выплата не найдена или не может быть отменена.' })
  @ApiResponse({ status: 500, description: 'Внутренняя ошибка сервера.' })
  async cancelPayout(@Body(new TelegapayValidationPipe()) dto: CancelPayoutDto) {
    return this.telegapayService.cancelPayout(dto);
  }

  @Post('send-receipt')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Отправить чек об оплате в Telegapay' })
  @ApiBody({ type: SendReceiptDto })
  @ApiResponse({ status: 200, description: 'Чек успешно отправлен.' })
  @ApiResponse({ status: 400, description: 'Неверные входные данные.' })
  @ApiResponse({ status: 404, description: 'Транзакция не найдена.' })
  @ApiResponse({ status: 500, description: 'Внутренняя ошибка сервера.' })
  async sendReceipt(@Body(new TelegapayValidationPipe()) dto: SendReceiptDto) {
    return this.telegapayService.sendReceipt(dto);
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Обработать входящий webhook от Telegapay',
    description: 'Этот эндпоинт предназначен для приема асинхронных уведомлений от Telegapay о статусах платежей и выплат. Важно настроить URL этого эндпоинта в личном кабинете Telegapay. Требуется верификация подписи (TODO).'
  })
  @ApiBody({ type: TelegapayWebhookDto })
  @ApiResponse({ status: 200, description: 'Webhook успешно обработан.' })
  @ApiResponse({ status: 400, description: 'Неверные ��ходные данные (ошибка валидации DTO).' })
  @ApiResponse({ status: 403, description: 'Ошибка верификации подписи вебхука (TODO).' })
  @ApiResponse({ status: 500, description: 'Внутренняя ошибка сервера при обработке вебхука.' })
  async handleWebhook(
    @Body(new TelegapayValidationPipe()) dto: TelegapayWebhookDto,
    @Headers() headers: Record<string, string>,
  ) {
    return this.telegapayService.handleWebhook(dto, headers);
  }
}