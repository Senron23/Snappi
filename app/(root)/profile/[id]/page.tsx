import EmptyState from "@/components/EmptyState";
import Header from "@/components/Header";
import VideoCard from "@/components/VideoCard";
import { dummyCards } from "@/constants";
import { getAllVideosByUser } from "@/lib/actions/video";
import { redirect } from "next/navigation";

const page = async ({ params, searchParams }: ParamsWithSearch) => {
  const { id } = await params;
  const { query, filter } = await searchParams;

  const { user, videos } = await getAllVideosByUser(id, query, filter);

  if (!user) redirect("/404");

  return (
    <div className="wrapper page">
      <Header
        subHeader={user?.email}
        title={user?.name}
        userImg={user?.image ?? ""}
      />
      {videos?.length > 0 ? (
        <section className="video-grid">
          {videos.map(({ video, user }) => (
            <VideoCard
              key={video.id}
              {...video}
              thumbnail={video.thumbnailUrl}
              userImg={user?.image || ""}
              username={user?.name || "Guest"}
            />
          ))}
        </section>
      ) : (
        <EmptyState
          icon="/assets/icons/video.svg"
          title="No Videos Available Yet"
          description="Videos will appear here once uploaded"
        />
      )}
    </div>
  );
};
export default page;
