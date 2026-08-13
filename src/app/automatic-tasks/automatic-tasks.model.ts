import { Injectable } from "@angular/core";

export enum AutomaticTaskType {
    Unknown = 0,
    SpIn = 1,
    Trasnfer = 2
}

export enum TaskStatus {
    Unknown = 0,
    Created = 1,
    Succeeded = 2,
    Failed = 3
}

export enum FrequencyType {
    Unknown = 0,
    Monthly = 1,
    Weekly = 2,
    Manual = 3
}

export interface ExecutedTaskResult {
    status: TaskStatus,
    errorMsg: string
}

export interface IAutomaticTask {
    id: string,
    description: string,
    accountId: number,
    accountName: string,
    amount: number,
    currencySymbol: string,
    // Already present on the API response (BaseScheduledTaskVm.spendTypeId) - this
    // was just never typed here. Needed to pre-fill/edit the transaction type.
    spendTypeId: number,
    lastExecutedStatus: TaskStatus,
    frequencyType: FrequencyType,
    taskType: AutomaticTaskType,
    days: number[],
    isPending: boolean
}

export interface UserSelectAccount {
    accountId: number,
    accountName: string,
    accountPeriodId: number
}

export enum ScheduleTaskRequestType {
    Unknown = 0,
    View = 1,
    New = 2
}

export interface BasicOption {
    id: number,
    name: string
}

// Shared between new-scheduled-task (create) and edit-scheduled-task (edit) -
// same weekly day options, same .NET DayOfWeek ordinals (0=Sunday..6=Saturday).
export const DAYS_OF_WEEK: BasicOption[] = [
    { id: 0, name: 'Sunday' },
    { id: 1, name: 'Monday' },
    { id: 2, name: 'Tuesday' },
    { id: 3, name: 'Wednesday' },
    { id: 4, name: 'Thursday' },
    { id: 5, name: 'Friday' },
    { id: 6, name: 'Saturday' }
];

export interface ExecutedTask {
    executedDate: Date;
    status: TaskStatus;
    message: string;
}

export class SpInAutomaticTask implements IAutomaticTask {
    isPending: boolean;
    accountId!: number;
    lastExecutedStatus: TaskStatus = TaskStatus.Unknown;
    id: string = "";
    description: string = "";
    accountName: string = "";
    amount: number = 0;
    currencySymbol: string = "";
    spendTypeId!: number;
    isSpend!: boolean;
    frequencyType!: FrequencyType;
    taskType!: AutomaticTaskType;
    days!: number[];
}

export class TransferAutomaticTask implements IAutomaticTask {
    isPending: boolean;
    accountId!: number;
    lastExecutedStatus: TaskStatus = TaskStatus.Unknown;
    id: string = "";
    description: string = "";
    accountName: string = "";
    amount: number = 0;
    currencySymbol: string = "";
    spendTypeId!: number;
    toAccountName: string = "";
    frequencyType!: FrequencyType;
    taskType!: AutomaticTaskType;
    days!: number[];
}