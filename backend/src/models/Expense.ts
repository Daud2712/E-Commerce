import { Schema, model, Document } from 'mongoose';

export interface IExpense extends Document {
  seller: Schema.Types.ObjectId;
  description: string;
  amount: number;
  category: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

const expenseSchema = new Schema({
  seller: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  description: { type: String, required: true },
  amount: { type: Number, required: true, min: 0 },
  category: { type: String, required: true },
  date: { type: Date, required: true, default: Date.now },
}, { timestamps: true });

const Expense = model<IExpense>('Expense', expenseSchema);
export default Expense;
