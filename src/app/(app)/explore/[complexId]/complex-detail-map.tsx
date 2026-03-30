"use client";

import dynamic from "next/dynamic";

const SingleMap = dynamic(() => import("./single-map").then((m) => m.SingleMap), {
  ssr: false,
  loading: () => <div className="h-40 w-full rounded-xl bg-gray-100 animate-pulse" />,
});

export function ComplexDetailMap({
  lat,
  lng,
  name,
  address,
}: {
  lat: number;
  lng: number;
  name: string;
  address: string;
}) {
  return <SingleMap lat={lat} lng={lng} name={name} address={address} />;
}
