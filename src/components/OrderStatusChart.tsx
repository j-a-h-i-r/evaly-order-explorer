import { ApexOptions } from "apexcharts";
import ReactApexChart from "react-apexcharts";
import { Order } from "./interface";


function prepareOrderStatusSeries(orders: Order[]) {
  const statusCountMap: { [key: string]: number } = {}
  orders.forEach((order) => {
    const { order_status: status } = order;
    if (statusCountMap[status]) {
      statusCountMap[status] += 1;
    } else {
      statusCountMap[status] = 1;
    }
  })

  const statusCounts = Object.entries(statusCountMap).map(([status, count]) => {
    return {
      x: status,
      y: count,
    }
  })
  return [{
    data: statusCounts,
  }]
}

const options: ApexOptions = {
  plotOptions: {
    bar: {
      distributed: true,
    }
  },
  grid: {
    row: {
      colors: ['#f3f4f5', '#fff'],
      opacity: 1
    }
  }
}

export function OrderStatusChart({orders}: {orders: Order[]}) {
  const status = prepareOrderStatusSeries(orders);

  return (
    <ReactApexChart series={status} options={options} type="bar" height={300}>
    </ReactApexChart>
  )
}

