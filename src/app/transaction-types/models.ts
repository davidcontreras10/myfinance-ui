import { DialogResultModel, TrxTypeViewModel } from "../services/models";

export interface TrxEventArgs {
    trxType: TrxTypeViewModel;
}

export interface TextChangedArgs extends TrxEventArgs {
    newValue: string;
    isNameField: boolean;
}


export interface NewTrxTypeDialogResult extends DialogResultModel<TrxTypeViewModel> {
}
