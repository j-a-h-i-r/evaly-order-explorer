import { useEffect, useState } from "react";
import dayjs from 'dayjs';
import NotificationsSystem, { atalhoTheme, useNotifications } from 'reapop';
import copy from 'copy-to-clipboard';
import { OrderTimelineChart } from "./OrderTimeline";
import { Order, OrderDeliveryDate, OrderDetail, OrderStatus, OrderSummaryStats } from "./interface";
import { fetchAllOrderDetail, fetchAllOrders } from "./api";
import { OrderStatusChart } from "./OrderStatusChart";
import { Badge } from "./Badge";
import githubLogo from './github.svg'
import { ORDER_DATA, ORDER_DETAIL_DATA } from './data';
import { PendingOrders } from "./PendingOrders";
import { OrderStatusComponent } from "./OrderStatus";

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

const COOKIE_CODE = "document.cookie.split('; ').find((x) => x.startsWith('token=')).split('=')[1]";

export function Home() {

  const [token, setToken] = useState<string>('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderDetails, setOrderDetails] = useState<OrderDetail[]>(ORDER_DETAIL_DATA);
  const [orderDeliveryData, setOrderDeliveryData] = useState<OrderDeliveryDate[]>(prepareOrderDeliveryData(ORDER_DETAIL_DATA));

  const { notify, notifications, dismissNotification } = useNotifications();

  const fetchButtonClicked = () => {
    console.log(token);
    if (!token) return;

    notify({
      message: 'Fetching order status. Wait a while',
      status: 'loading',
      id: 'order-loading',
      dismissAfter: 0,
    });

    fetchAllOrders(token)
    .then((orders) => {
      console.log(orders);
      setOrders(orders)
      dismissNotification('order-loading');
      notify({message: 'Order status fetch complete', status: 'success'})
    })
    .catch((err) => {
      console.log(err)
      notify({message: 'Error while fetching order status', status: 'error'})
    })
  }

  useEffect(() => {
    if (!token) return;

    notify({
      message: 'Fetching order detail data. Wait a while',
      status: 'loading',
      id: 'order-detail-loading',
      dismissAfter: 0,
    })

    fetchAllOrderDetail(token, orders)
    .then((orderDetails) => {
      // console.log('details', orderDetails);
      setOrderDetails(orderDetails);
      dismissNotification('order-detail-loading');
      notify({message: 'Order detail fetch complete.', status: 'success'})

      const orderDeliveryData = prepareOrderDeliveryData(orderDetails);
      setOrderDeliveryData(orderDeliveryData);
    })
    .catch((err) => {
      console.error(err);
      notify({message: 'Error while fetching order details', status: 'error'});
    })
  }, [orders]);

  const copyCommandToClipboard = () => {
    copy(COOKIE_CODE);
    notify({message: 'Code copied to clipboard', 'status': 'success'});
  }

  console.log('deliver', orderDetails);
  console.log('deliver', orderDeliveryData);

  return (
    <div className="pb-4">
      <div className="container mx-auto px-4 text-center">
        <div className="relative">
          <p className="text-4xl font-bold ">
            View your order history
          </p>
          <div className="absolute top-1 right-0">
            <a href="https://github.com/j-a-h-i-r/evaly-order-explorer" className="ml-auto" target="_blank" rel="noreferrer">
              <img src={githubLogo} width={32} alt="GitHub repository Url" className="ml-auto"></img>
            </a>
          </div>
        </div>

        <div className="bg-blue-100 bg-opacity-10 mt-5 p-4 ring-2 rounded text-left">
          <p className="font-bold">How to use?</p>
          <p>An access token is required to fetch your Evaly orders. The easiest way to get it is as follows</p>
          <ol className="list-decimal list-inside">
            <li>Login at evaly.com.bd</li>
            <li>Open console panel and paste the following (click to copy), <br />
              <p onClick={copyCommandToClipboard} className="bg-purple-100 inline-block py-2 px-4 rounded font-mono">{COOKIE_CODE}</p>
            </li>
            <li>Copy the output and paste in the below input box</li>
          </ol>
        </div>

        <div className="bg-yellow-100 mt-5 p-4 ring-2 rounded text-left ring-yellow-300">
          <p className="font-bold">Warning</p>
          <p> Access token is sensitive information. Do not share it with anyone. This web app requires the access token as I have not found any other way of fetching order data without the access token.</p>
          <p> This web app runs entirely on your browser. The only external service being used is a proxy server. It is required to bypass the CORS policy. </p>
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

            <OrderTimelineChart orders={orderDetails} />

            <p className="bg-blue-50 font-semibold inline-block px-6 py-2 rounded-full text-left">
              You have total <span className="bg-blue-300 font-bold px-2 rounded-full">{orders.length}</span> orders.
                Out of these, <span className="bg-blue-300 font-bold px-2 rounded-full">{orderDeliveryData.length}</span> has been delivered.
            </p>

            <OrderStatusComponent orderDeliveryData={orderDeliveryData} />

          </div>
        </div>
      </div>

      <NotificationsSystem theme={atalhoTheme} notifications={notifications} dismissNotification={(id) => dismissNotification(id)} />
    </div>
  )
}