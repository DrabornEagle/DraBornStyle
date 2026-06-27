import React from 'react';

import { DkdTransactionPanel, DkdV02Master, DkdV02Service, DkdV02Transaction } from './dkd_transaction_panel';

type Props = {
  services: DkdV02Service[];
  masters: DkdV02Master[];
  records: DkdV02Transaction[];
  debtTotal: number;
  revenueTotal: number;
  startRecord: (serviceId: string, masterId?: string | null) => void;
  finishRecord: (recordId: string, extraPrice: number, discountAmount: number, note: string) => void;
};

export function DkdBusinessTransactionSectionExample(props: Props) {
  return (
    <DkdTransactionPanel
      services={props.services}
      masters={props.masters}
      transactions={props.records}
      debtTotal={props.debtTotal}
      revenueTotal={props.revenueTotal}
      onStart={props.startRecord}
      onFinish={props.finishRecord}
    />
  );
}
