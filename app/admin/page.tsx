import BarChartBox from "@/components/admin/charts/barChartBox/BarChartBox";
import BigChartBox from "@/components/admin/charts/bigChartBox/BigChartBox";
import ChartBox from "@/components/admin/charts/chartBox/ChartBox";
import PieChartBox from "@/components/admin/charts/pieChartBox/PieChartBox";
import TopBox from "@/components/admin/charts/topBox/TopBox";
import {
  barChartBoxRevenue,
  barChartBoxVisit,
  chartBoxConversion,
  chartBoxProduct,
  chartBoxRevenue,
  chartBoxUser,
} from "@/constants/data";

const Home = () => {
  return (
    <div className="grid grid-cols-4 gap-5 auto-rows-[minmax(180px,auto)] grid-flow-dense xl:grid-cols-3 lg:grid-cols-2 md:grid-cols-1 sm:auto-rows-[minmax(120px,auto)]">
      <div className="box box1 p-5 rounded-lg border-2 border-gray-200 col-span-1 row-span-3">
        <TopBox />
      </div>
      <div className="box box2 p-5 rounded-lg border-2 border-gray-200">
        <ChartBox {...chartBoxUser} />
      </div>
      <div className="box box3 p-5 rounded-lg border-2 border-gray-200">
        <ChartBox {...chartBoxProduct} />
      </div>
      <div className="box box4 p-5 rounded-lg border-2 border-gray-200 col-span-1 row-span-3">
        <PieChartBox />
      </div>
      <div className="box box5 p-5 rounded-lg border-2 border-gray-200">
        <ChartBox {...chartBoxConversion} />
      </div>
      <div className="box box6 p-5 rounded-lg border-2 border-gray-200">
        <ChartBox {...chartBoxRevenue} />
      </div>
      <div className="box box7 p-5 rounded-lg border-2 border-gray-200 col-span-2 row-span-2 md:hidden">
        <BigChartBox />
      </div>
      <div className="box box8 p-5 rounded-lg border-2 border-gray-200">
        <BarChartBox {...barChartBoxVisit} />
      </div>
      <div className="box box9 p-5 rounded-lg border-2 border-gray-200">
        <BarChartBox {...barChartBoxRevenue} />
      </div>
    </div>
  );
};

export default Home;