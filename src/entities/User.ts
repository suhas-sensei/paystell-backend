import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    OneToMany,
    CreateDateColumn,
    UpdateDateColumn,
  } from "typeorm";
  import { EmailVerification } from "./EmailVerification";
  
  @Entity()
  export class User {
    @PrimaryGeneratedColumn("uuid")
    id!: string;
  
    @Column({ unique: true })
    email!: string;
  
    @Column()
    password!: string;
  
    @Column()
    firstName!: string;
  
    @Column()
    lastName!: string;
  
    @Column({ default: false })
    isEmailVerified!: boolean;
  
    @OneToMany(() => EmailVerification, (emailVerification) => emailVerification.user)
    emailVerifications!: EmailVerification[];
  
    @CreateDateColumn()
    createdAt!: Date;
  
    @UpdateDateColumn()
    updatedAt!: Date;
  }
  