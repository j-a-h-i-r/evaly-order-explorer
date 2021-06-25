import { ApexOptions } from 'apexcharts';
import dayjs from 'dayjs';
import ReactApexChart from 'react-apexcharts';
import { Order, OrderDeliveryDate, OrderDetail, OrderHistory, OrderStatus } from './interface';

type InnerSeriesValue = [number, number];
interface StatusDuration { order_status: OrderStatus, from: string, to: string }
type OrderHistoryWithInvoice = StatusDuration & { invoice_no: string };
type OrderWithTimeline = Omit<OrderDetail, 'histories'> & {histories: StatusDuration[]}

function prepareInnerSeries(histories: OrderHistoryWithInvoice[]) {
  const invoices: {[key: string]: StatusDuration} = {};

  histories.forEach((history) => {
    invoices[history.invoice_no] = history;
  })

  const series: any = [];
  Object.keys(invoices).forEach((invoice_no) => {
    const { from, to } = invoices[invoice_no];
    series.push({
      x: invoice_no,
      y: [dayjs(from).valueOf(), dayjs(to).valueOf()]
    })
  })
  return series;
}

function prepareSeries(orders: OrderDetail[]) {
  const deliveredOrders = orders.filter((order) => order.order_status === 'delivered');
  const combinedHistories: OrderHistoryWithInvoice[] = [];

  const formattedOrders: OrderWithTimeline[] = deliveredOrders.map((order) => {
    const { histories } = order;
    const historiesSorted = histories.sort((a, b) => dayjs(a.date).diff(b.date));
    const formattedHistories: StatusDuration[] = [];
    for (let i=0; i<historiesSorted.length-1; i++) {
      formattedHistories.push({
        from: historiesSorted[i].date,
        to: historiesSorted[i+1].date,
        order_status: historiesSorted[i].order_status,
      })
    }
    return {
      ...order,
      histories: formattedHistories,
    };
  })

  formattedOrders.forEach((order) => {
    const { invoice_no, histories } = order;
    histories.forEach((history) => {
      combinedHistories.push({
        ...history,
        invoice_no,
      })
    })
  })

  console.log(combinedHistories);

  const orderStatus: OrderStatus[] = ['pending', 'confirmed', 'processing', 'picked', 'shipped', 'delivered'];
  const series: any = [];
  orderStatus.forEach((status) => {
    const filteredHistories = combinedHistories.filter((history) => history.order_status === status)
    const inner = prepareInnerSeries(filteredHistories);
    if (inner.length > 0) {
      series.push({
        name: status,
        data: inner,
      })
    }
  })
  console.log("all", series);
  return series;
}


const options: ApexOptions = {
  title: {
    text: 'Timeline of delivered orders',
    align: 'center',
    margin: 2,
  },
  subtitle: {
    text: 'Delivered ordered timeline broken by time spent in each step',
    align: 'center',
  },
  legend: {
    position: 'top',
  },
  plotOptions: {
    bar: {
      horizontal: true,
      distributed: true,
      dataLabels: {
        hideOverflowingLabels: false,
        position: 'top',
      },
      rangeBarGroupRows: true,
    }
  },
  colors: [
    "#008FFB", "#00E396", "#FEB019", "#FF4560", "#775DD0",
    "#3F51B5", "#546E7A", "#D4526E", "#8D5B4C", "#F86624",
    "#D7263D", "#1B998B", "#2E294E", "#F46036", "#E2C044"
  ],
  fill: {
    type: 'fill',
  },
  dataLabels: {
    enabled: false,
    offsetX: 60,
    textAnchor: 'start',
    formatter: function (val: any, opts: any) {
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

export function OrderTimelineChart({ orders }: { orders: OrderDetail[] }) {
  const series = prepareSeries(orders);

  console.log("Series", series);

  return (
    <ReactApexChart series={series} options={options} type="rangeBar">
    </ReactApexChart>
  )
}