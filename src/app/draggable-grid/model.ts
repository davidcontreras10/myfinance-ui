export class DragGridDataSource {
    cols: DragGridCol[] = [];
}

export class DragGridCol {
    items: DragGridItem[] = [];
}

export class DragGridItem {
    id: number;
    name: string;
}

export class DragGridPosition {
    id: number;
    position: number;
}