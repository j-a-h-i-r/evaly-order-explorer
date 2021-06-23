import { Order, OrderApiResponse, OrderDetail, OrderDetailApiResponse } from "./interface";

const PROXY = 'https://card-cors.herokuapp.com/';
const orderApiUrl = 'https://api.evaly.com.bd/core/custom/orders/';
const orderDetailApiUrl = 'https://api.evaly.com.bd/core/orders/histories/';


export async function fetchPageOfOrder(token: string, orderApiUrl: string): Promise<OrderApiResponse> {
  const response = await fetch(PROXY + orderApiUrl, {
    headers: {
      Authorization: 'Bearer ' + token,
    }
  })
  return response.json() as Promise<OrderApiResponse>;
}

export async function fetchAllOrders(token: string, pageNum: string = '1'): Promise<Order[]> {
  console.log('pageNum', pageNum);
  const url = orderApiUrl + `?page=${pageNum}`;
  console.log('url', url);

  const orderResponse = await fetchPageOfOrder(token, url);
  const orders: Order[] = orderResponse.results;

  console.log('response', orderResponse);

  if (orderResponse.next) {
    const pageNum = /page=(\d+)/.exec(orderResponse.next)?.[1];
    if (pageNum) {
      return fetchAllOrders(token, pageNum)
      .then((nextOrders) => orders.concat(nextOrders))
      .catch(() => orders);
    } else {
      return orders;
    }
  } else {
    return orders;
  }
}

export async function fetchOneOrderHistory(token: string, orderNumber: string): Promise<OrderDetailApiResponse> {
  const url = orderDetailApiUrl + orderNumber + '/';
  const response = await fetch(PROXY + url, {
    headers: {
      Authorization: 'Bearer ' + token,
    }
  })
  return response.json() as Promise<OrderDetailApiResponse>;
}

export async function fetchAllOrderDetail(token: string, orders: Order[]): Promise<OrderDetail[]> {
  const orderNumbers = orders.map((order) => order.invoice_no);

  const orderDetailResponses = await Promise.all(
    orderNumbers.map((orderNumber) => fetchOneOrderHistory(token, orderNumber))
  )

  const history = orderDetailResponses.map((resp) => resp.data);
  return history;
}