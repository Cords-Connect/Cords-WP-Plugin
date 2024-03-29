import { A } from "@solidjs/router";
import { createQuery } from "@tanstack/solid-query";
import { ResourceType } from "cords-sdk";
import { convert } from "html-to-text";
import { Component, Show } from "solid-js";
import { useCords } from "../lib/cords";

type Props = {
	service: ResourceType;
};

const ServiceItem: Component<Props> = (props) => {
	const cords = useCords();
	const resource = createQuery(() => ({
		queryKey: ["resource", props.service.id],
		queryFn: () => cords.resource(props.service.id),
		initialData: props.service,
		throwOnError: true,
	}));

	return (
		<Show when={resource.data}>
			<A
				href={`/resource/${resource.data.id}`}
				class="bg-elevation1 px-8 py-4 flex flex-col gap-1.5 items-start max-w-full border-hairline border-t"
			>
				<p class="font-header text-primary">{resource.data.name.en}</p>
				<p class="text-sm line-clamp-2 max-w-full">
					{convert(resource.data.description.en)}
				</p>
			</A>
		</Show>
	);
};

export default ServiceItem;
