import { AfterViewInit, Directive, ElementRef, EventEmitter, Inject, OnDestroy, Output, DOCUMENT } from "@angular/core";
import { Subscription, filter, fromEvent } from "rxjs";

@Directive({
    standalone: false,
    selector: '[clickOutside]',
})
export class ClickOutsideDirective implements AfterViewInit, OnDestroy {
    @Output() clickOutside = new EventEmitter<void>();

    documentClickSubscription: Subscription | undefined;

    constructor(
        private element: ElementRef,
        @Inject(DOCUMENT) private document: Document
    ) { }

    ngAfterViewInit(): void {
        this.documentClickSubscription = fromEvent(this.document, 'click')
            .pipe(
                filter((event) => {
                    return !this.isInside(event.target as HTMLElement);
                })
            )
            .subscribe(() => {
                this.clickOutside.emit();
            });
    }

    ngOnDestroy(): void {
        this.documentClickSubscription?.unsubscribe();
    }

    isInside(elementToCheck: HTMLElement): boolean {
        return (
            elementToCheck === this.element.nativeElement ||
            this.element.nativeElement.contains(elementToCheck)
        );
    }
}