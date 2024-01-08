import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { DragGridCol, DragGridDataSource, DragGridItem, DragGridPosition } from './model';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-draggable-grid',
  templateUrl: './draggable-grid.component.html',
  styleUrls: ['./draggable-grid.component.css']
})
export class DraggableGridComponent implements OnInit, OnChanges {
  dataGridSource: DragGridDataSource | null;
  @Input() dataSource: DragGridItem[];
  @Input() columnsNumber: number;
  @Output() positionsChanged: EventEmitter<DragGridPosition[] | null> = new EventEmitter();
  @Output() itemClicked: EventEmitter<DragGridItem> = new EventEmitter();

  constructor() { }
  ngOnChanges(changes: SimpleChanges): void {
    this.sortDataGridSource();
  }

  ngOnInit(): void {
  }

  private sortDataGridSource() {
    if (this.dataSource && this.dataSource.length > 0 && this.columnsNumber > 0) {
      this.dataGridSource = new DragGridDataSource();
      for (let i = 0; i < this.columnsNumber; i++) {
        this.dataGridSource.cols.push(new DragGridCol());
      }

      let colIndex = 0;
      for (let item of this.dataSource) {
        if (colIndex === this.columnsNumber) {
          colIndex = 0;
        }

        this.dataGridSource.cols[colIndex].items.push(item);
        colIndex++;
      }
    }
    else {
      this.dataGridSource = null;
    }
  }

  private readItems(): DragGridItem[] | null {
    const endPosition = this.getValidEmptyEndPosition();
    if (this.dataGridSource && this.dataGridSource.cols && this.dataGridSource.cols.length > 0 && endPosition) {
      let items: DragGridItem[] = [];
      let currentPos: GridPosition = {
        colIndex: 0,
        rowIndex: 0
      }
      while (true) {
        const gridItem = this.getDragGridItem(currentPos);
        if (gridItem == null) {
          if (this.PosEquals(endPosition, currentPos)) {
            return items;
          }
          else {
            return null;
          }
        }

        items.push(gridItem);
        const next = this.getNextPosition(currentPos);
        if (next) {
          currentPos = next;
        }
        else {
          return null;
        }
      }
    }

    return null;
  }

  private getDragGridItem(position: GridPosition): DragGridItem | null {
    const { rowIndex, colIndex } = position;
    if (this.dataGridSource && this.dataGridSource.cols && colIndex < this.dataGridSource.cols.length) {
      const column = this.dataGridSource.cols[colIndex];
      if (column.items && rowIndex < column.items.length) {
        return column.items[rowIndex];
      }
    }

    return null;
  }

  private getValidEmptyEndPosition(): { colIndex: number, rowIndex: number } | null {
    if (this.dataGridSource && this.dataGridSource.cols && this.dataGridSource.cols.length > 0) {
      const expectedColsSize: number[] = [];
      const initialRowsSize = Math.floor(this.dataSource.length / this.dataGridSource.cols.length);
      for (let i = 0; i < this.dataGridSource.cols.length; i++) {
        expectedColsSize.push(initialRowsSize);
      }

      let assignSpace = this.dataSource.length % this.dataGridSource.cols.length;
      let lastAssinedColumn = this.dataGridSource.cols.length - 1;
      for (let i = 0; i < this.dataGridSource.cols.length; i++) {
        if (assignSpace === 0) {
          break;
        }

        lastAssinedColumn = i;
        expectedColsSize[i]++;
        assignSpace--;
      }

      const rowIndex = expectedColsSize[lastAssinedColumn] - 1;
      const nextPosition = this.getNextPosition({ colIndex: lastAssinedColumn, rowIndex: rowIndex });
      return nextPosition;
    }

    return null;
  }

  private getNextPosition(position: GridPosition): { colIndex: number, rowIndex: number } | null {
    let { colIndex, rowIndex } = position;
    if (this.dataGridSource?.cols == null) {
      return null;
    }

    colIndex++;
    if (colIndex >= this.dataGridSource.cols.length) {
      colIndex = 0;
      rowIndex++;
    }

    return { colIndex, rowIndex };
  }

  private udpateItemsList() {
    this.positionsChanged.emit(this.readPositions());
  }

  private readPositions(): DragGridPosition[] | null {
    const items = this.readItems();
    if (items) {
      const positions: DragGridPosition[] = [];
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        positions.push({
          id: item.id,
          position: i
        });
      }

      return positions;
    }

    return null;
  }

  itemClick(item: DragGridItem) {
    this.itemClicked.emit(item);
  }

  drop(event: CdkDragDrop<any[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex);
    }

    this.udpateItemsList();
  }

  public PosEquals(position1: GridPosition, position2: GridPosition) {
    return position1.colIndex === position2.colIndex && position1.rowIndex === position2.rowIndex;
  }
}

class GridPosition {
  colIndex: number;
  rowIndex: number;
}

