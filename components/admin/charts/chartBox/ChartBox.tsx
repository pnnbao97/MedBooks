'use client';
import Link from "next/link";
import { Line, LineChart, ResponsiveContainer, Tooltip } from "recharts";

type Props = {
  color: string;
  icon: string;
  title: string;
  dataKey: string;
  number: number | string;
  percentage: number;
  chartData: object[];
};

const ChartBox = (props: Props) => {
  return (
    <div className="flex h-full sm:flex-col">
      <div className="flex-3 flex flex-col justify-between sm:gap-5">
        <div className="flex items-center gap-2.5 2xl:text-sm">
          <img src={props.icon} alt="" className="w-6 h-6" />
          <span>{props.title}</span>
        </div>
        <h1 className="text-2xl font-bold 2xl:text-xl">{props.number}</h1>
        <Link href="/" style={{ color: props.color }} className="text-sm">
          View all
        </Link>
      </div>
      <div className="flex-2 flex flex-col justify-between">
        <div className="w-full h-full">
          <ResponsiveContainer width="99%" height="100%">
            <LineChart data={props.chartData}>
              <Tooltip
                contentStyle={{ background: "transparent", border: "none" }}
                labelStyle={{ display: "none" }}
                position={{ x: 10, y: 70 }}
              />
              <Line
                type="monotone"
                dataKey={props.dataKey}
                stroke={props.color}
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-col text-right">
          <span
            className="font-bold text-xl 2xl:text-base"
            style={{ color: props.percentage < 0 ? "tomato" : "limegreen" }}
          >
            {props.percentage}%
          </span>
          <span className="text-sm">this month</span>
        </div>
      </div>
    </div>
  );
};

export default ChartBox;