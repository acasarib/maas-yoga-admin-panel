export const CASH_PAYMENT_TYPE = 'Efectivo';

export const LOG_PAYMENT_ACTIONS = {
    UPDATE: "UPDATE",
    CREATE: "CREATE",
    DELETE: "DELETE",
    VERIFICATION: "VERIFICATION",
};

export const STUDENT_MONTHS_CONDITIONS = {
    PAID: "PAID",
    NOT_TAKEN: "NOT_TAKEN",
    NOT_PAID: "NOT_PAID",
    PENDING: "PENDING",
    SUSPEND: "SUSPEND",
    CIRCULAR_NOT_PAID: "CIRCULAR_NOT_PAID",
}

export const STUDENT_STATUS = {
    ACTIVE: "ACTIVE",
    SUSPEND: "SUSPEND",
}

export const TABLE_SEARCH_CRITERIA = {
    EQUAL: "EQUAL",
    CONTAINS: "CONTAINS",
}

export const PAYMENT_OPTIONS = [
    {
        label: 'Mercado pago',
        value: 'Mercado pago'
    },
    {
        label: 'Paypal',
        value: 'Paypal'
    },
    {
        label: 'Efectivo',
        value: CASH_PAYMENT_TYPE
    },
    {
        label: 'Transferencia',
        value: 'Transferencia'
    },
    {
        label: 'Tarjeta de credito',
        value: 'Tarjeta de credito'
    },
    {
        label: 'Débito de cuenta',
        value: 'Débito de cuenta'
    },
    {
        label: 'Débito de tarjeta',
        value: 'Débito de tarjeta'
    },
];

export const SPECIFICATION_QUERY_SEPARATOR = ";";

export const APP_VERSION = "1.0.9";