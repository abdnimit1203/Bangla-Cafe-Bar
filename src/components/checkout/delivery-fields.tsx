"use client";

import { useCallback } from "react";
import type { DeliveryArea, DeliveryDistrict } from "@classytic/commerce-client/delivery-types";
import { Input, Select } from "@/components/ui/field";
import { InlineNotice } from "@/components/ui/states";
import { useAsyncResource } from "@/hooks/use-async-resource";
import { getStorefrontClient } from "@/lib/commerce/client";
import { describeError } from "@/lib/commerce/errors";
import type { FieldErrors } from "@/lib/validation/checkout";
import type { DeliveryDetails } from "@/types/fulfillment";

export interface DistrictData {
  requiresArea: boolean;
  data: DeliveryDistrict[];
}

export function DeliveryFields({
  value,
  onChange,
  errors,
  districts,
  districtsLoading,
  districtsError,
}: {
  value: DeliveryDetails;
  onChange: (next: DeliveryDetails) => void;
  errors: FieldErrors;
  districts: DistrictData | null;
  districtsLoading: boolean;
  districtsError: unknown;
}) {
  const district = value.district;
  const districtName = value.districtName;
  const loadAreas = useCallback(
    async (signal: AbortSignal): Promise<DeliveryArea[]> => {
      if (!district) return [];
      return (await getStorefrontClient().deliveryAreas(districtName || district, { signal })).data;
    },
    [district, districtName],
  );
  const areas = useAsyncResource<DeliveryArea[]>(loadAreas);
  const requiresArea = districts?.requiresArea ?? false;

  const grouped = (districts?.data ?? []).reduce<Record<string, DeliveryDistrict[]>>((acc, d) => {
    (acc[d.divisionName] ??= []).push(d);
    return acc;
  }, {});

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {districtsError ? (
        <InlineNotice tone="danger" className="sm:col-span-2">
          {describeError(districtsError, "Delivery areas couldn't load. Please refresh the page.")}
        </InlineNotice>
      ) : null}
      <Select
        id="district"
        label="District"
        value={value.district}
        error={errors.district}
        disabled={districtsLoading}
        onChange={(event) => {
          const id = event.target.value;
          const match = districts?.data.find((d) => d.id === id);
          onChange({ ...value, district: id, districtName: match?.name ?? id, areaId: undefined, areaName: undefined });
        }}
      >
        <option value="">{districtsLoading ? "Loading districts..." : "Select district"}</option>
        {Object.entries(grouped).map(([division, list]) => (
          <optgroup key={division} label={division}>
            {list.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </optgroup>
        ))}
      </Select>
      <Select
        id="areaId"
        label="Delivery area"
        optional={!requiresArea}
        hint={requiresArea ? undefined : "Helps us price delivery accurately."}
        value={value.areaId ?? ""}
        error={errors.areaId}
        disabled={!value.district || areas.loading}
        onChange={(event) => {
          const id = Number(event.target.value);
          const match = (areas.data ?? []).find((a) => a.id === id);
          onChange({ ...value, areaId: match ? match.id : undefined, areaName: match?.name });
        }}
      >
        <option value="">{areas.loading ? "Loading areas..." : value.district ? "Select area" : "Choose a district first"}</option>
        {(areas.data ?? []).map((a) => (
          <option key={a.id} value={a.id}>
            {a.name}
          </option>
        ))}
      </Select>
      <Input
        id="line1"
        label="Street address"
        placeholder="House, road, block"
        autoComplete="street-address"
        value={value.line1}
        error={errors.line1}
        wrapperClassName="sm:col-span-2"
        onChange={(event) => onChange({ ...value, line1: event.target.value })}
      />
      <Input
        id="line2"
        label="Flat / landmark"
        optional
        placeholder="Flat 4B, opposite the mosque"
        value={value.line2 ?? ""}
        onChange={(event) => onChange({ ...value, line2: event.target.value })}
      />
      <Input
        id="postalCode"
        label="Postal code"
        optional
        inputMode="numeric"
        autoComplete="postal-code"
        value={value.postalCode ?? ""}
        onChange={(event) => onChange({ ...value, postalCode: event.target.value })}
      />
    </div>
  );
}
