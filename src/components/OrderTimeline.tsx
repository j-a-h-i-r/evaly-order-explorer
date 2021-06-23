import { ApexOptions } from 'apexcharts';
import dayjs from 'dayjs';
import ReactApexChart from 'react-apexcharts';
import { OrderDeliveryDate } from './interface';

function prepareSeries(orderDates: OrderDeliveryDate[]) {
  const series = orderDates.map((order) => {
      return {
          x: order.invoice_no,
          y: [
            order.orderDate,
            order.deliveryDate,
          ],
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

export function OrderTimelineChart({orderDeliveryDates}: {orderDeliveryDates: OrderDeliveryDate[]}) {
  const series = prepareSeries(orderDeliveryDates);

  console.log("Series", series);
  
  return (
    <ReactApexChart series={series} options={options} type="rangeBar">
    </ReactApexChart>
  )
}