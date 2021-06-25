import dayjs from "dayjs";
import { Badge } from "./Badge";
import { OrderDeliveryDate, OrderSummaryStats } from "./interface";

function calculateStatistics(deliveryData: OrderDeliveryDate[]): OrderSummaryStats {
  function cmp(a: OrderDeliveryDate, b: OrderDeliveryDate): number {
    return a.orderDate - b.orderDate;
  }

  const sorted = [...deliveryData].sort(cmp);
  const timeInDays = sorted.map((data) => {
    const { orderDate: order, deliveryDate: deliver } = data;
    return dayjs(deliver).diff(order, 'd');
  })
  const daysSorted = [...timeInDays].sort((a, b) => (a - b));

  const average = daysSorted.reduce((acc, cur) => acc + cur, 0) / daysSorted.length;
  const minimum = daysSorted[0];
  const maximum = daysSorted[daysSorted.length - 1];
  const averageRounded = Math.round(average * 100) / 100;
  return {
    average: averageRounded,
    minimum,
    maximum,
  }
}

export function OrderStatusComponent({ orderDeliveryData }: { orderDeliveryData: OrderDeliveryDate[] }) {
  const stats = calculateStatistics(orderDeliveryData);
  return (
    <div className="flex justify-evenly mt-5">
      <Badge header="Minimum" content={stats?.minimum} />
      <Badge header="Average" content={stats?.average} />
      <Badge header="Maximum" content={stats?.maximum} />
    </div>
  )
}