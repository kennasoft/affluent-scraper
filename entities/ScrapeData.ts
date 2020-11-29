import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity("scrape_data")
export default class ScrapeData {
  @PrimaryColumn("varchar")
  public date: string;

  @Column("varchar", { name: "overview_link" })
  public overviewLink: string;

  @Column("float", { name: "commissions_total" })
  public commissionsTotal: number;

  @Column("float", { name: "net_sales" })
  public netSales: number;

  @Column("int", { name: "net_leads" })
  netLeads: number;

  @Column("int")
  clicks: number;

  @Column("int")
  epc: number;

  @Column("int")
  impressions: number;

  @Column("float")
  cr: number;

  constructor(init?: Partial<ScrapeData>) {
    Object.assign(this, init);
  }
}
