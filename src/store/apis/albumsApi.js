import { faker } from "@faker-js/faker";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

/* ----------------------------- QUERY VS MUTATE ---------------------------- */
//query get
//mutation post delete put patch

/* -------------------------- RTK QUERY REQUIREMENT ------------------------- */
//1-createApi
//2-reducerPath is not allow to be duplicate name as topLevel State Object
//----rtk query use a fetch under the hood
//3-fetchBaseQuery Function to make pre-Configured version of fetch
//4-the api need to know how and where send request add a baseQuery,baseUrl
//5-endpoinst fetchAlbum:query-createAlbum:mutation-removeAlbum:mutation
//----get:localhost:3005/albums?userId=1 queryString:params
//----post:localhost:3005/albums{title:'Heaven',userId:1}
//----delete:localhost:3005/albums/1
//6-export all of automatically generated hooks
//7-connect the api to the store reducer middleware and listener

const pause = (duration) => {
  return new Promise((resolve) => {
    setTimeout(resolve, duration);
  });
};

const albumsApi = createApi({
  reducerPath: "albums",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:3005",
    fetchFn: async (...args) => {
      //remove for production just for see spinner effect
      await pause(1000);
      return fetch(...args);
    },
  }),
  endpoints(builder) {
    return {
      removeAlbum: builder.mutation({
        //@ts-ignore
        invalidatesTags: (result, error, album) => {
          return [{ type: "Album", id: album.id }];
        },
        query: (album) => {
          return {
            url: `/albums/${album.id}`,
            method: "DELETE",
          };
        },
      }),
      addAlbum: builder.mutation({
        //@ts-ignore
        // invalidatesTags: ["Album"],
        invalidatesTags: (result, error, user) => {
          return [{ type: "UsersAlbums", id: user.id }];
        },
        query: (user) => {
          return {
            url: "/albums",
            body: {
              userId: user.id,
              title: faker.commerce.productName(),
            },
            method: "POST",
          };
        },
      }),
      fetchAlbums: builder.query({
        //@ts-ignore
        // providesTags: ["Album"],
        //result, error, user automatic args
        providesTags: (result, error, user) => {
          // return [{ type: "album", id: user.id }];
          const tags = result.map((album) => {
            return { type: "Album", id: album.id };
          });
          tags.push({ type: "UsersAlbums", id: user.id });
          return tags;
        },
        query: (user) => {
          return {
            url: "/albums",
            params: {
              userId: user.id,
            },
            method: "GET",
          };
        },
      }),
    };
  },
});
export const {
  useFetchAlbumsQuery,
  useAddAlbumMutation,
  useRemoveAlbumMutation,
} = albumsApi;
export { albumsApi };
