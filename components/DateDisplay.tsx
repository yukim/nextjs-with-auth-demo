import { FC } from "react";

type DateValue = {
    value: string | Date;
    format?: "date" | "dateTime";
}

const formatters = {
    date: new Intl.DateTimeFormat("ja-JP-u-ca-japanese", { dateStyle: "medium" }),
    dateTime: new Intl.DateTimeFormat("ja-JP-u-ca-japanese", { dateStyle: "medium", timeStyle: "short" }),
}

const DateDisplay: FC<DateValue> = ({ value, format = "date" }) => {
    const date = typeof value === "string" ? new Date(value) : value
    return (
        <span>{formatters[format].format(date)}</span>
    )
}

export default DateDisplay