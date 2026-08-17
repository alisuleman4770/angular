import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

type TableStatus = 'occupied' | 'available';

interface FloorTable {
  id: string;
  seats: number;
  status: TableStatus;
  order?: string;
  elapsed?: string;
}

@Component({
  selector: 'app-tables',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tables.html',
  styleUrl: './tables.css',
})
export class Tables {

  activeSection: 'Hall' | 'Basement' = 'Hall';

  searchTerm = '';

  statusFilter: 'all' | TableStatus = 'all';

  refreshedAt = new Date();

  readonly tables: FloorTable[] = [

    // HALL
    {
      id: 'T-1',
      seats: 4,
      status: 'occupied',
      order: '#5318',
      elapsed: '2d 8h'
    },

    {
      id: 'T-2',
      seats: 4,
      status: 'occupied',
      order: '#5317',
      elapsed: '2d 8h'
    },

    {
      id: 'T-3',
      seats: 4,
      status: 'occupied',
      order: '#5335',
      elapsed: '1d 23h'
    },

    {
      id: 'T-4',
      seats: 4,
      status: 'available'
    },

    {
      id: 'T-5',
      seats: 4,
      status: 'occupied',
      order: '#5304',
      elapsed: '2d 11h'
    },

    {
      id: 'T-6',
      seats: 4,
      status: 'occupied',
      order: '#5303',
      elapsed: '2d 11h'
    },

    {
      id: 'T-7',
      seats: 4,
      status: 'occupied',
      order: '#5308',
      elapsed: '2d 10h'
    },

    {
      id: 'T-8',
      seats: 4,
      status: 'occupied',
      order: '#5311',
      elapsed: '2d 9h'
    },

    {
      id: 'T-9',
      seats: 4,
      status: 'occupied',
      order: '#5310',
      elapsed: '2d 10h'
    },

    {
      id: 'T-10',
      seats: 4,
      status: 'occupied',
      order: '#5305',
      elapsed: '2d 10h'
    },

    {
      id: 'T-11',
      seats: 4,
      status: 'occupied',
      order: '#5312',
      elapsed: '2d 9h'
    },

    // BASEMENT
    {
      id: 'B-12',
      seats: 4,
      status: 'occupied',
      order: '#5323',
      elapsed: '2d 7h'
    },

    {
      id: 'B-13',
      seats: 4,
      status: 'occupied',
      order: '#5324',
      elapsed: '1d 23h'
    },

    {
      id: 'B-14',
      seats: 4,
      status: 'occupied',
      order: '#5325',
      elapsed: '2d 7h'
    },

    {
      id: 'B-15',
      seats: 4,
      status: 'occupied',
      order: '#5326',
      elapsed: '2d 8h'
    },

    {
      id: 'B-16',
      seats: 4,
      status: 'occupied',
      order: '#5327',
      elapsed: '2d 8h'
    },

    {
      id: 'B-17',
      seats: 4,
      status: 'occupied',
      order: '#5328',
      elapsed: '1d 23h'
    },

    {
      id: 'B-18',
      seats: 4,
      status: 'occupied',
      order: '#5329',
      elapsed: '2d 7h'
    }
  ];

  get visibleTables(): FloorTable[] {

    const prefix =
      this.activeSection === 'Hall'
        ? 'T-'
        : 'B-';

    return this.tables.filter((table) => {

      const inSection =
        table.id.startsWith(prefix);

      const matchesSearch =
        table.id
          .toLowerCase()
          .includes(
            this.searchTerm
              .toLowerCase()
              .trim()
          );

      const matchesStatus =
        this.statusFilter === 'all' ||
        table.status === this.statusFilter;

      return (
        inSection &&
        matchesSearch &&
        matchesStatus
      );
    });
  }

  get sectionTables(): FloorTable[] {

    const prefix =
      this.activeSection === 'Hall'
        ? 'T-'
        : 'B-';

    return this.tables.filter(
      table => table.id.startsWith(prefix)
    );
  }

  get occupiedCount(): number {

    return this.sectionTables.filter(
      table => table.status === 'occupied'
    ).length;
  }

  get availableCount(): number {

    return this.sectionTables.filter(
      table => table.status === 'available'
    ).length;
  }

  get occupancy(): number {

    if (!this.sectionTables.length) {
      return 0;
    }

    return Math.round(
      (this.occupiedCount /
        this.sectionTables.length) *
        100
    );
  }

  get occupancyWidth(): string {

    return `${this.occupancy}%`;
  }

  switchSection(
    section: 'Hall' | 'Basement'
  ): void {

    this.activeSection = section;

    this.searchTerm = '';

    this.statusFilter = 'all';
  }

  refreshTables(): void {

    this.refreshedAt = new Date();
  }

  resetFilters(): void {

    this.searchTerm = '';

    this.statusFilter = 'all';
  }

  trackByTable(
    _: number,
    table: FloorTable
  ): string {

    return table.id;
  }
}