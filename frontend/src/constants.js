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
    {
        label: 'Crédito en proveedor',
        value: 'Crédito en proveedor'
    },
    {
        label: 'Crédito en cuenta',
        value: 'Crédito en cuenta'
    },
    {
        label: 'Crédito en tarjeta',
        value: 'Crédito en tarjeta'
    },
];

export const SPECIFICATION_QUERY_SEPARATOR = ";";

export const APP_VERSION = "1.3.0";

export const COLORS = {
    primary: {
        50: "#fff7ed",
        100: "#ffedd5",
        200: "#fed7aa",
        300: "#fdba74",
        400: "#ffbc1b",
        500: "#ff9800",
        550: "#ea8215",
        600: "#D97706",
        700: "#bb4c02",
        800: "#9a3412",
        900: "#713f12",
        950: "#481700"
    },
    red: {
        50: "#fef2f2",
        100: "#fee2e2",
        200: "#fecaca",
        300: "#fca5a5",
        400: "#f87171",
        500: "#ef4444",
        600: "#dc2626",
        700: "#b91c1c",
        800: "#991b1b",
        900: "#7f1d1d"
    }
}