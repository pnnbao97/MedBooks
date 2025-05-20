import BookList from "@/components/BookList";
import BookOverview from "@/components/BookOverview";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { sampleBooks } from "@/constants";
import { db } from "@/database/drizzle";
import { users } from "@/database/schema";
import Image from "next/image";

const Home = async () => {
  const result = await db.select().from(users);
  console.log(JSON.stringify(result, null, 2));
  return (
    <>
      <BookOverview { ... sampleBooks[0] }/>

      <BookList 
        title="Sách liên quan"
        books={sampleBooks}
        containerClassName="mt-28"
      />
      <Footer />
    </>
  );
}
export default Home;