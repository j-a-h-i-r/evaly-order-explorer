import { ApexOptions } from "apexcharts";
import dayjs, { Dayjs } from "dayjs";
import ReactApexChart from "react-apexcharts";
import { OrderDetail, OrderHistory } from "./interface";

function getActiveOrders(orderDetails: OrderDetail[]) {
  const activeOrders = orderDetails.filter(({order_status}) => !(order_status === 'cancel' || order_status === 'delivered') );
  return activeOrders;
}

function getSortedDates(orderHistories: OrderHistory[]): Dayjs[] {
  const parsedOrderDates = orderHistories.map((history) => dayjs(history.date));
  parsedOrderDates.sort((a, b) => (a.valueOf() - b.valueOf()))
  return parsedOrderDates;
}

function prepareActiveOrderDurationSeries(activeOrders: OrderDetail[]) {
  const series = activeOrders.map((order) => {
    const { histories } = order;
    const orderDates = getSortedDates(histories);

    return {
      x: order.invoice_no,
      y: [
        orderDates[0].valueOf(),
        orderDates[orderDates.length - 1].valueOf(),
      ]
    }
  })
  return [{
      data: series,
  }]
}

const options: ApexOptions = {
  plotOptions: {
    bar: {
      horizontal: true,
      distributed: true,
      dataLabels: {
        hideOverflowingLabels: false,
        position: 'top',
      },
    }
  },
  dataLabels: {
    enabled: true,
    offsetX: 60,
    textAnchor: 'start',
    formatter: function(val: any, opts: any) {
      var a = dayjs(val[0])
      var b = dayjs(val[1])
      var diff = b.diff(a, 'd')
      return diff + (diff > 1 ? ' days' : ' day')
    },
    background: {
      dropShadow: {
        enabled: false,
      },
      opacity: 1,
      enabled: true,
      foreColor: '#fd5f77',
      borderColor: '#ff7dff',
      padding: 6,
    },
    style: {
      colors: ['#f3f4f5', '#fff'],
    }
  },
  xaxis: {
    type: 'datetime'
  },
  grid: {
    row: {
      colors: ['#f3f4f5', '#fff'],
      opacity: 1
    }
  }
}

export function PendingOrders({orderDetails}: {orderDetails: OrderDetail[]}) {
  const activeOrders = getActiveOrders(orderDetails);
  console.log(activeOrders);
  const series = prepareActiveOrderDurationSeries(activeOrders);
  console.log(series);


  return (
    <ReactApexChart series={series} type="rangeBar" options={options}></ReactApexChart>
  );
}