import { topDealUsers } from "@/constants/data";

const TopBox = () => {
  return (
    <div className="flex flex-col h-full p-4 sm:p-2">
      <h1 className="text-2xl font-bold mb-4 sm:text-xl">Top Deals</h1>
      <div className="flex flex-col gap-4">
        {topDealUsers.map((user) => (
          <div
            className="flex justify-between items-center p-2 hover:bg-gray-100 sm:gap-2"
            key={user.id}
          >
            <div className="flex items-center gap-3">
              <img
                src={user.img}
                alt=""
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="flex flex-col">
                <span className="font-medium text-base sm:text-sm">{user.username}</span>
                <span className="text-sm text-gray-500 sm:text-xs">{user.email}</span>
              </div>
            </div>
            <span className="font-bold text-lg sm:text-base">${user.amount}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopBox;