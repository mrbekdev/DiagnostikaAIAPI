import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/send-message.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Chat & Real-time Messaging')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('contacts')
  @ApiOperation({ summary: 'Barcha shifokor va hamshiralar kontaktlari (oxirgi xabar va unread count bilan)' })
  getContacts(@CurrentUser('id') currentUserId: string) {
    return this.chatService.getContacts(currentUserId);
  }

  @Get('history/:userId')
  @ApiOperation({ summary: 'Tanlangan xodim bilan one-to-one yozishmalar tarixi' })
  getHistory(
    @CurrentUser('id') currentUserId: string,
    @Param('userId') otherUserId: string,
  ) {
    return this.chatService.getHistory(currentUserId, otherUserId);
  }

  @Post('send')
  @ApiOperation({ summary: 'Shifokor yoki hamshiraga yangi xabar yuborish' })
  sendMessage(
    @CurrentUser('id') currentUserId: string,
    @Body() dto: SendMessageDto,
  ) {
    return this.chatService.sendMessage(currentUserId, dto);
  }

  @Put('read/:senderId')
  @ApiOperation({ summary: 'Xabarlarni o‘qilgan holatga o‘tkazish' })
  markAsRead(
    @CurrentUser('id') currentUserId: string,
    @Param('senderId') senderId: string,
  ) {
    return this.chatService.markAsRead(currentUserId, senderId);
  }
}
