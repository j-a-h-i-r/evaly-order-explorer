import { useEffect, useState } from "react";
import dayjs from 'dayjs';
import { OrderTimelineChart } from "./OrderTimeline";
import { Order, OrderDeliveryDate, OrderDetail } from "./interface";
import { ORDER_DATA, ORDER_DETAIL_DATA } from './data';
import { fetchAllOrderDetail, fetchAllOrders } from "./api";
import { OrderStatusChart } from "./OrderStatusChart";
import { Badge } from "./Badge";
import { PendingOrders } from "./PendingOrders";

function prepareOrderDeliveryData(orderDetail: OrderDetail[]): OrderDeliveryDate[] {
  const onlyDelivered = orderDetail.filter((order) => order.order_status === 'delivered');
  const deliveryData = onlyDelivered.map((order): OrderDeliveryDate => {
    const { invoice_no, histories } = order;
    const orderDate = histories.find((o) => o.order_status === 'pending')?.date;
    const deliveryDate = histories.find((o) => o.order_status === 'delivered')?.date;

    return {
      invoice_no,
      orderDate: dayjs(orderDate).valueOf(),
      deliveryDate: dayjs(deliveryDate).valueOf()
    }
  })
  return deliveryData;
}

function calculateStatistics(deliveryData: OrderDeliveryDate[]) {
  function cmp(a: OrderDeliveryDate, b: OrderDeliveryDate): number {
    return a.orderDate - b.orderDate;
  }

  const sorted = [...deliveryData].sort(cmp);
  const timeInDays = sorted.map((data) => {
    const {orderDate: order, deliveryDate: deliver} = data;
    return dayjs(deliver).diff(order, 'd');
  })
  const daysSorted = [...timeInDays].sort((a,b ) => (a-b));
 
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

export function Home() {

  const [token, setToken] = useState('');
  const [orders, setOrders]: [ Order[], Function ] = useState([]);
  const [orderDetails, setOrderDetails]: [ OrderDetail[], Function ] = useState([]);
  const [orderDeliveryData, setOrderDeliveryData]: [OrderDeliveryDate[], Function] = useState([]);
  const [stats, setStats]: [any, Function] = useState([]);

  const fetchButtonClicked = () => {
    console.log(token);

    if (!token) return;

    fetchAllOrders(token)
    .then((orders) => {
      console.log(orders);
      setOrders(orders);
    })
    .catch(err => console.log(err))
  }

  useEffect(() => {
    if (!token) return;
    fetchAllOrderDetail(token, orders)
    .then((orderDetails) => {
      console.log('details', orderDetails);
      setOrderDetails(orderDetails);

      const orderDeliveryData = prepareOrderDeliveryData(orderDetails);
      setOrderDeliveryData(orderDeliveryData);
      setStats(calculateStatistics(orderDeliveryData));
    })
  }, [orders]);

  console.log('deliver', orderDetails);
  console.log('deliver', orderDeliveryData);

  return (
    <div className="mx-32 pb-4">
      <div className="container text-center">
        <div className="text-4xl font-bold mt-2">
          View your order history
        </div>

        <div className="mt-10">
          <input className="border-2 p-2 rounded w-2/4 border-blue-300" placeholder="Paste token" type="text" value={token} onChange={e => setToken(e.target.value)}></input>
          <button type="button" className="border-2 ml-2 p-2 px-4 rounded bg-blue-200 border-blue-300 font-bold" onClick={fetchButtonClicked}>Fetch</button>
        </div>


        <div className="border-2 border-blue-100 mt-10 rounded">
          <p className="font-bold text-lg bg-blue-100 py-1"> Order Status </p>

          <div className="py-4">
            <OrderStatusChart orders={orders}/>
          </div>
        </div>

        <div className="border-2 border-blue-100 mt-10 rounded">
          <p className="font-bold text-lg bg-blue-100 py-1">Order Timeline</p>

          <div className="py-4">

            {/* <PendingOrders orderDetails={orderDetails} /> */}

            <OrderTimelineChart orderDeliveryDates={orderDeliveryData} />

            <p className="bg-blue-50 font-semibold inline-block px-6 py-2 rounded-full text-left">
              You have total <span className="bg-blue-300 font-bold px-2 rounded-full">{orders.length}</span> orders.
                Out of these, <span className="bg-blue-300 font-bold px-2 rounded-full">{orderDeliveryData.length}</span> has been delivered.
            </p>

            <div className="flex justify-evenly mt-5">
              <Badge header="Minimum" content={stats.minimum} />
              <Badge header="Average" content={stats.average} />
              <Badge header="Maximum" content={stats.maximum} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}