import { DialogResultModel, TrxTypeViewModel } from "../services/models";

export interface TrxEventArgs {
    trxType: TrxTypeViewModel;
}

export interface EditedArgs extends TrxEventArgs {
    name: string;
    description: string;
}


export interface NewTrxTypeDialogResult extends DialogResultModel<TrxTypeViewModel> {
}
