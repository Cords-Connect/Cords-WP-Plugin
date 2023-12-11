import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

const PageSchema = z.object({
	id: z.number(),
	content: z.object({
		rendered: z.string(),
	}),
	title: z.object({
		rendered: z.string(),
	}),
	meta: z.object({
		cords_enabled: z.boolean().optional(),
		cords_widget: z.boolean().optional(),
	}),
});
type Page = z.infer<typeof PageSchema>;

const updatePage = async ({ id, meta }: { id: number; meta: Page["meta"] }) => {
	await fetch(`${(window as any).wpApiSettings.root}wp/v2/pages/${id}`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"X-WP-Nonce": (window as any).wpApiSettings.nonce,
		},
		credentials: "include",
		body: JSON.stringify({
			meta,
		}),
	});
	// TODO: Optimistic update
};

const Pages = () => {
	const queryClient = useQueryClient();
	const mutation = useMutation({
		mutationFn: updatePage,
		onSettled: () =>
			queryClient.invalidateQueries({
				queryKey: ["pages"],
			}),
	});

	const { data: pages } = useQuery({
		queryKey: ["pages"],
		queryFn: async () => {
			const res = await fetch(`${(window as any).wpApiSettings.root}wp/v2/pages`);
			const data = await res.json();
			console.log(data);
			return PageSchema.array().parse(data);
		},
	});

	return (
		<div className="flex flex-col gap-3 max-w-sm">
			<table className="wp-list-table widefat fixed striped table-view-list">
				<thead>
					<tr>
						<th>Title</th>
						<th>Content</th>
						<th>CORDS Enabled</th>
						<th>CORDS Widget</th>
					</tr>
				</thead>
				<tbody>
					{pages?.map((page) => (
						<tr key={page.id}>
							<td>{page.title.rendered.length ? page.title.rendered : "No Title"}</td>
							<td>
								<p className="truncate">{page.content.rendered}</p>
							</td>
							<td>
								<select
									name="enabled"
									value={page.meta.cords_enabled ? "true" : "false"}
									onChange={(e) =>
										mutation.mutate({
											id: page.id,
											meta: {
												...page.meta,
												cords_enabled: e.target.value === "true",
											},
										})
									}
								>
									<option value="true">True</option>
									<option value="false">False</option>
								</select>
							</td>
							<td>
								<select
									name="enabled"
									value={page.meta.cords_widget ? "true" : "false"}
									onChange={(e) =>
										mutation.mutate({
											id: page.id,
											meta: {
												...page.meta,
												cords_widget: e.target.value === "true",
											},
										})
									}
								>
									<option value="true">Show</option>
									<option value="false">Hide</option>
								</select>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
};

export default Pages;