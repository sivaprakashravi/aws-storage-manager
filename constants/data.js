const orders = [
    {
        fs_id: '13004',
        order_id: 43481289,
        is_cod_mitra: false,
        accept_partial: false,
        invoice_ref_num: 'INV/20200110/XX/I/502',
        products: [
            {
                id: 15242279,
                name: 'Chitato Rasa Beef BBQ 35 gr isi 20 pcs',
                quantity: 1,
                notes: '',
                weight: 0.004,
                total_weight: 0.004,
                price: 98784,
                total_price: 98784,
                currency: 'Rp',
                sku: '11550001',
                is_wholesale: true
            }
        ],
        products_fulfilled: [
            {
                product_id: 15242279,
                quantity_deliver: 1,
                quantity_reject: 0
            }
        ],
        device_type: '',
        buyer: {
            id: 8970588,
            name: 'Mitra Test Account',
            phone: '62888888888',
            email: 'mitra_test@tokopedia.com'
        },
        shop_id: 479066,
        payment_id: 11687315,
        recipient: {
            name: 'Mitra Test Account',
            phone: '62888888888',
            address: {
                address_full: 'Kobakma, Kab. Mamberamo Tengah, Papua, 99558',
                district: 'Kobakma',
                city: 'Kab. Mamberamo Tengah',
                province: 'Papua',
                country: 'Indonesia',
                postal_code: '99558',
                district_id: 5455,
                city_id: 555,
                province_id: 33,
                geo: '-3.69624360109313,139.10973580486393'
            }
        },
        logistics: {
            shipping_id: 999,
            district_id: 0,
            city_id: 0,
            province_id: 0,
            geo: '',
            shipping_agency: 'Custom Logistik',
            service_type: 'Service Normal'
        },
        amt: {
            ttl_product_price: 98784,
            shipping_cost: 10000,
            insurance_cost: 0,
            ttl_amount: 108784,
            voucher_amount: 0,
            toppoints_amount: 0
        },
        dropshipper_info: {},
        voucher_info: {
            voucher_code: '',
            voucher_type: 0
        },
        order_status: 700,
        warehouse_id: 0,
        fulfill_by: 0,
        create_time: 1578671153,
        custom_fields: {
            awb: 'CSDRRRRR502'
        },
        promo_order_detail: {
            order_id: 43481289,
            total_cashback: 0,
            total_discount: 20000,
            total_discount_product: 10000,
            total_discount_shipping: 10000,
            total_discount_details: [
                {
                    amount: 10000,
                    type: 'discount_product'
                },
                {
                    amount: 10000,
                    type: 'discount_shipping'
                }
            ],
            summary_promo: [
                {
                    name: 'Promo Product July',
                    is_coupon: false,
                    show_cashback_amount: true,
                    show_discount_amount: true,
                    cashback_amount: 0,
                    cashback_points: 0,
                    type: 'discount',
                    discount_amount: 10000,
                    discount_details: [
                        {
                            amount: 10000,
                            type: 'discount_product'
                        }
                    ],
                    invoice_desc: 'PRODUCTDISC'
                },
                {
                    name: 'Promo Ongkir',
                    is_coupon: false,
                    show_cashback_amount: true,
                    show_discount_amount: true,
                    cashback_amount: 0,
                    cashback_points: 0,
                    type: 'discount',
                    discount_amount: 10000,
                    discount_details: [
                        {
                            amount: 10000,
                            type: 'discount_shipping'
                        }
                    ],
                    invoice_desc: 'ONGKIRFREE'
                }
            ]
        }
    }
];
const json = {orders};
module.exports = { json };