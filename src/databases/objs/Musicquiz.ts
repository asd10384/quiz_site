import { config } from "dotenv";
import { Document, model, Schema } from "mongoose";
config();

export interface Type extends Document {
  id: string,
  name: string,
  type: string,
  limit: number,
  member: number,
  musiccount: number,
  private: boolean,
  password: string
};

const Schemadata: Schema = new Schema({
  id: { type: String },
  name: { type: String },
  type: { type: String },
  limit: { type: Number },
  member: { type: Number },
  musiccount: { type: Number },
  private: { type: Boolean },
  password: { type: String }
});

export const Model = model<Type>('Musicquiz', Schemadata);