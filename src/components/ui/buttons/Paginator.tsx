export default function Paginator({
  pages,
  currentPage,
  route,
}: {
  pages: number[];
  currentPage: number;
  route: string;
}) {
  return (
    <div className="btn-group mt-auto  mx-auto">
      {pages.map((pNum) => (
        <>
          {pNum > 0 ? (
            <a
              href={`${route}${pNum}`}
              className={
                "btn btn-md w-10 sm:w-12" +
                (currentPage === pNum ? " btn-active " : "")
              }
            >
              {pNum}
            </a>
          ) : (
            <div className="btn btn-disabled rounded-none">...</div>
          )}
        </>
      ))}
    </div>
  );
}
