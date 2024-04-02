import { TrxTypeViewModel } from "../services/models";

export interface TextCangedArgs {
    trxType: TrxTypeViewModel;
    newValue: string;
    isNameField: boolean;
}