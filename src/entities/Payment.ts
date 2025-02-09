import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"

@Entity()
export class Payment {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ unique: true })
  paymentId: string
}

