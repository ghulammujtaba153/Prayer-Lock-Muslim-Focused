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

  async createBulk(payload: { year: number, data: any }): Promise<any> {
    const { year, data } = payload;
    const months = [
      'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
      'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
    ];

    const eventDocuments: any[] = [];

    for (const [monthName, events] of Object.entries(data)) {
      const monthIndex = months.indexOf(monthName.toUpperCase());
      if (monthIndex === -1) continue;

      if (!Array.isArray(events)) continue;

      for (const item of (events as any[])) {
        const dateStr = item.date; // e.g., "1", "8–9", "11–July 19"
        const eventTitle = item.event;

        // Clean up the date string (handle different dash types)
        const normalizedDate = dateStr.replace(/–|—/g, '-');
        
        let startStr: string;
        let endStr: string | undefined;

        if (normalizedDate.includes('-')) {
          const parts = normalizedDate.split('-').map(p => p.trim());
          const startPart = parts[0];
          const endPart = parts[1];

          // Handle "11-July 19" (starts June 11, ends July 19)
          // We assume the month from the key if not specified
          
          startStr = this.formatDate(year, monthIndex, startPart);
          
          // Check if endPart has a month name
          const hasMonth = months.find(m => endPart.toUpperCase().includes(m));
          if (hasMonth) {
            const endMonthIndex = months.indexOf(hasMonth);
            const DayMatch = endPart.match(/\d+/);
            const day = DayMatch ? DayMatch[0] : '1';
            endStr = this.formatDate(year, endMonthIndex, day, true); // Exclusive end
          } else {
            endStr = this.formatDate(year, monthIndex, endPart, true); // Exclusive end
          }
        } else {
          startStr = this.formatDate(year, monthIndex, normalizedDate);
        }

        eventDocuments.push({
          title: eventTitle,
          start: startStr,
          end: endStr,
          backgroundColor: this.getEventCategoryColor(eventTitle)
        });
      }
    }

    if (eventDocuments.length > 0) {
      return this.eventModel.insertMany(eventDocuments);
    }
    return { message: 'No events found to import' };
  }

  private formatDate(year: number, month: number, day: string, exclusive: boolean = false): string {
    const d = new Date(year, month, parseInt(day, 10));
    if (exclusive) {
      d.setDate(d.getDate() + 1);
    }
    // Return YYYY-MM-DD
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  private getEventCategoryColor(title: string): string {
    const t = title.toLowerCase();
    if (t.includes('market close')) return '#ef4444'; // Red
    if (t.includes('fomc') || t.includes('cpi') || t.includes('ppi') || t.includes('pce') || t.includes('employment') || t.includes('pmi')) return '#f0b90b'; // Yellow (Econ)
    if (t.includes('cfp') || t.includes('super bowl') || t.includes('olympics') || t.includes('world cup') || t.includes('ncaa') || t.includes('mlb') || t.includes('masters') || t.includes('u.s. open')) return '#3788d8'; // Blue (Sports)
    return '#848e9c'; // Gray (Other)
  }
}
