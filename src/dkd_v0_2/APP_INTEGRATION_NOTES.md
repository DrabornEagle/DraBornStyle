# DraBornStyle v0.2 App Integration Notes

Added files:

- src/dkd_v0_2/dkd_transaction_panel.tsx
- src/dkd_v0_2/dkd_transaction_api.ts
- src/dkd_v0_2/dkd_business_transaction_section_example.tsx

Goal:

Show the transaction panel inside the Business Panel transaction/payment section.

Mobile test order:

1. Add a service.
2. Add a master.
3. Start a service record.
4. Select active record.
5. Enter extra amount, discount and note.
6. Finish the record.
7. Recent records should show completed status.
8. Business debt should increase by the platform fee.
