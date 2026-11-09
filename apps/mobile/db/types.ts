// Types of the database helpers in db/.

export interface TransactionDb {
  withTransactionAsync(task: () => Promise<void>): Promise<void>;
}
