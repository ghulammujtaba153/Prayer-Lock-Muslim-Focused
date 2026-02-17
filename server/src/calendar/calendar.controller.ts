import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CalendarService } from './calendar.service';
import { CalendarEvent } from './schemas/event.schema';

@Controller('calendar')
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Post()
  async create(@Body() eventData: Partial<CalendarEvent>) {
    return this.calendarService.create(eventData);
  }

  @Get()
  async findAll() {
    return this.calendarService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.calendarService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateData: Partial<CalendarEvent>,
  ) {
    return this.calendarService.update(id, updateData);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.calendarService.remove(id);
  }
}
