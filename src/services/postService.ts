import http from 'helpers/http';
import config from 'config';
import { Post } from 'models/post';
import { ResponseData, ResponseDataPagination } from 'models/response';

const postService = {
	list: (page: number = 1, page_size: number = 10) => {
		return http.get<ResponseDataPagination<Post[]>>({
			url: config.API.END_POINT.CRUD_POST,
			params: {
				page,
				page_size
			}
		});
	},
	show: (id: number) => {
		return http.get<ResponseData<Post>>({
			url: `${config.API.END_POINT.CRUD_POST}/${id}`
		});
	},
	/* create: (data: CreateUser) => {
		return http.post<ResponseData<User>>({
			url: config.API.END_POINT.CRUD_POST,
			data: data
		});
	},
	update: (id: number, data: UpdateUser) => {
		return http.put<ResponseData<User>>({
			url: `${config.API.END_POINT.CRUD_POST}/${id}`,
			data: data
		});
	}, */
	delete: (id: number) => {
		return http.delete<ResponseData<any>>({
			url: `${config.API.END_POINT.CRUD_POST}/${id}`
		});
	}
};

export default postService;
