import type { Transaction } from "@/domain";
import type {
  DateRange,
  TransactionInput,
  TransactionRepository,
} from "../ports/transaction-repository";

export class InMemoryTransactionRepository implements TransactionRepository {
  readonly items: Transaction[] = [];
  private nextId = 1;

  async listByDateRange({ start, endExclusive }: DateRange): Promise<Transaction[]> {
    return this.items.filter(
      (item) => item.occurredOn >= start && item.occurredOn < endExclusive,
    );
  }

  async create(input: TransactionInput): Promise<void> {
    this.items.push({ id: `t-${this.nextId++}`, ...input });
  }

  async update(id: string, input: TransactionInput): Promise<void> {
    const index = this.items.findIndex((item) => item.id === id);
    this.items[index] = { id, ...input };
  }

  async delete(id: string): Promise<void> {
    const index = this.items.findIndex((item) => item.id === id);
    this.items.splice(index, 1);
  }
}
