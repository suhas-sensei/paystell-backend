import { Repository } from "typeorm";
import { PaymentLink } from "../entities/PaymentLink";

export class PaymentLinkService {
  constructor(
    private readonly paymentLinkRepository: Repository<PaymentLink>,
  ) {}

  async createPaymentLink(data: Partial<PaymentLink>): Promise<PaymentLink> {
    const paymentLink = this.paymentLinkRepository.create(data);
    return await this.paymentLinkRepository.save(paymentLink);
  }

  async getPaymentLinkById(id: string): Promise<PaymentLink | null> {
    return await this.paymentLinkRepository.findOne({ where: { id } });
  }

  async updatePaymentLink(
    id: string,
    data: Partial<PaymentLink>,
  ): Promise<PaymentLink | null> {
    await this.paymentLinkRepository.update(id, data);
    return this.getPaymentLinkById(id);
  }

  async deletePaymentLink(id: string): Promise<boolean> {
    const result = await this.paymentLinkRepository.delete(id);
    return result.affected !== 0;
  }

  async getPaymentLinksByUserId(userId: string): Promise<PaymentLink[]> {
    return await this.paymentLinkRepository.find({
      where: { userId: Number(userId) },
    });
  }
}
