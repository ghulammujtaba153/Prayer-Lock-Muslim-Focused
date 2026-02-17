import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CalendarEvent } from './schemas/event.schema';

@Injectable()
export class CalendarService {
  constructor(
    @InjectModel(CalendarEvent.name) private readonly eventModel: Model<CalendarEvent>,
  ) {}

  async create(eventData: Partial<CalendarEvent>): Promise<CalendarEvent> {
    const newEvent = new this.eventModel(eventData);
    return newEvent.save();
  }

  async findAll(): Promise<CalendarEvent[]> {
    return this.eventModel.find().exec();
  }

  async findOne(id: string): Promise<CalendarEvent> {
    const event = await this.eventModel.findById(id).exec();
    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }
    return event;
  }

  async update(id: string, updateData: Partial<CalendarEvent>): Promise<CalendarEvent> {
    const updatedEvent = await this.eventModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();
    if (!updatedEvent) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }
    return updatedEvent;
  }

  async remove(id: string): Promise<any> {
    const result = await this.eventModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }
    return result;
  }
}
