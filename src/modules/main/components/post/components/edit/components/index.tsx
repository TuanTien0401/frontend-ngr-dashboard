import axios from 'axios';
import BreadcrumbComponent from 'components/Breadcrumb/components';
import CardComponent from 'components/Card/components';
import { FormikProps, useFormik } from 'formik';
import { useParams } from 'react-router-dom';
import * as userConstant from 'constants/user';
import * as Yup from 'yup';
import userService from 'services/userService';
import classNames from 'classnames';
import ImageInput from 'components/ImageInput/components';
import imageService from 'services/imageService';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { useEffect, useState } from 'react';
import { UpdateUserFormik, User } from 'models/user';
import Loadingomponent from 'components/Loading/components';
import toastify from 'helpers/toastify';

type Props = {};

const EditPostComponent: React.FC<Props> = () => {
	const params = useParams();
	const [isUploading, setUploading] = useState(false);
	const [isUpdating, setUpdating] = useState(false);
	const [isLoading, setLoading] = useState(true);
	const [data, setData] = useState<User>({} as User);

	const formik: FormikProps<UpdateUserFormik> = useFormik<UpdateUserFormik>({
		enableReinitialize: true,
		initialValues: {
			first_name: data.first_name,
			last_name: data.last_name,
			email: data.email,
			user_name: data.user_name,
			password: '',
			password_confirmation: '',
			role: data.role,
			status: data.status,
			image: null
		},
		validationSchema: Yup.object({
			first_name: Yup.string()
				.required('The first name is required.')
				.max(20, 'The first name must not be greater than 20 characters.'),
			last_name: Yup.string()
				.required('The last name is required.')
				.max(20, 'The last name must not be greater than 20 characters.'),
			email: Yup.string().required('Email is required.'),
			user_name: Yup.string()
				.required('The user name is required.')
				.min(3, 'The user name must be at least 3 characters.')
				.max(20, 'The user name must not be greater than 20 characters.'),
			password: Yup.string()
				.min(6, 'The password must be at least 6 characters.')
				.max(66, 'The password must not be greater than 66 characters.'),
			password_confirmation: Yup.string().test(
				'passwords-match',
				'The password confirmation does not match.',
				function (value) {
					return this.parent.password === value;
				}
			),
			role: Yup.string()
				.required('The role is required.')
				.oneOf(
					[
						userConstant.USER_ROLE_OWNER,
						userConstant.USER_ROLE_ADMIN,
						userConstant.USER_ROLE_MODERATOR,
						userConstant.USER_ROLE_VIEWER
					],
					'The role invalid.'
				),
			status: Yup.string()
				.required('The status is required.')
				.oneOf(
					[userConstant.USER_STATUS_ACTIVE, userConstant.USER_STATUS_INACTIVE, userConstant.USER_STATUS_BANNED],
					'The status invalid.'
				)
		}),
		onSubmit: (values, { setErrors }) => {
			new Promise<{ image?: string }>((resolve, reject) => {
				if (!values.image) {
					return resolve({});
				}
				setUploading(true);
				imageService
					.upload({
						image: values.image
					})
					.then((response) => {
						return resolve({ image: response.data.data.image });
					})
					.catch((error) => {
						return reject(error);
					})
					.finally(() => {
						setUploading(false);
					});
			})
				.then((result) => {
					setUpdating(true);
					const payload = {
						first_name: values.first_name,
						last_name: values.last_name,
						email: values.email,
						user_name: values.user_name,
						role: values.role,
						status: values.status,
						...(values.password && {
							password: values.password
						}),
						...(result.image && {
							avatar: result.image
						})
					};
					userService
						.update(Number(params.userId), payload)
						.then((response) => {
							setData(response.data.data);
							toastify.success('Update user success');
						})
						.catch((error) => {
							if (axios.isAxiosError(error)) {
								if (error.response?.data.errors && error.response.status === 400) {
									setErrors(error.response.data.errors);
								}
							}
						})
						.finally(() => {
							setUpdating(false);
						});
				})
				.catch((error) => {
					if (axios.isAxiosError(error)) {
						if (error.response?.data.errors && error.response.status === 400) {
							setErrors(error.response.data.errors);
						}
					}
				})
				.finally(() => {});
		}
	});

	useEffect(() => {
		setLoading(true);
		userService
			.show(Number(params.userId))
			.then((response) => {
				setData(response.data.data);
			})
			.catch((error) => {})
			.finally(() => {
				setLoading(false);
			});
	}, [params.userId]);

	return (
		<>
			<BreadcrumbComponent className="mb-4">Edit user</BreadcrumbComponent>
			<div className="grid grid-cols-1 gap-4">
				<div className="col-span-1 w-full">
					<CardComponent header="Edit user">
						{isLoading ? (
							<Loadingomponent />
						) : (
							<form onSubmit={formik.handleSubmit}>
								<div className="grid grid-cols-2 gap-4">
									<div className="col-span-2 md:col-span-1">
										<label htmlFor="first_name" className="inline-block font-medium text-gray-600 mb-1">
											First name
										</label>
										<div className="relative">
											<input
												type="text"
												placeholder="Enter first name"
												className={classNames(
													'rounded-md flex-1 appearance-none border border-gray-300 w-full py-2 px-4 bg-white text-gray-700 placeholder-gray-400 shadow-sm text-base focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent',
													{
														'focus:ring-red-600 border-red-600':
															formik.errors.first_name && formik.touched.first_name
													}
												)}
												onChange={formik.handleChange}
												onBlur={formik.handleBlur}
												value={formik.values.first_name}
												name="first_name"
												id="first_name"
											/>
										</div>
										{formik.errors.first_name && formik.touched.first_name && (
											<div className="text-red-700 mt-1 text-sm">{formik.errors.first_name}</div>
										)}
									</div>
									<div className="col-span-2 md:col-span-1">
										<label htmlFor="last_name" className="inline-block font-medium text-gray-600 mb-1">
											Last name
										</label>
										<div className="relative">
											<input
												type="text"
												placeholder="Enter last name"
												className={classNames(
													'rounded-md flex-1 appearance-none border border-gray-300 w-full py-2 px-4 bg-white text-gray-700 placeholder-gray-400 shadow-sm text-base focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent',
													{
														'focus:ring-red-600 border-red-600':
															formik.errors.last_name && formik.touched.last_name
													}
												)}
												onChange={formik.handleChange}
												onBlur={formik.handleBlur}
												value={formik.values.last_name}
												name="last_name"
												id="last_name"
											/>
										</div>
										{formik.errors.last_name && formik.touched.last_name && (
											<div className="text-red-700 mt-1 text-sm">{formik.errors.last_name}</div>
										)}
									</div>
									<div className="col-span-2 md:col-span-1">
										<label htmlFor="user_name" className="inline-block font-medium text-gray-600 mb-1">
											User name
										</label>
										<div className="relative">
											<input
												type="text"
												placeholder="Enter user name"
												className={classNames(
													'rounded-md flex-1 appearance-none border border-gray-300 w-full py-2 px-4 bg-white text-gray-700 placeholder-gray-400 shadow-sm text-base focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent',
													{
														'focus:ring-red-600 border-red-600':
															formik.errors.user_name && formik.touched.user_name
													}
												)}
												onChange={formik.handleChange}
												onBlur={formik.handleBlur}
												value={formik.values.user_name}
												name="user_name"
												id="user_name"
											/>
										</div>
										{formik.errors.user_name && formik.touched.user_name && (
											<div className="text-red-700 mt-1 text-sm">{formik.errors.user_name}</div>
										)}
									</div>
									<div className="col-span-2 md:col-span-1">
										<label htmlFor="email" className="inline-block font-medium text-gray-600 mb-1">
											Email
										</label>
										<div className="relative">
											<input
												type="text"
												placeholder="Enter email"
												className={classNames(
													'rounded-md flex-1 appearance-none border border-gray-300 w-full py-2 px-4 bg-white text-gray-700 placeholder-gray-400 shadow-sm text-base focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent',
													{
														'focus:ring-red-600 border-red-600':
															formik.errors.email && formik.touched.email
													}
												)}
												onChange={formik.handleChange}
												onBlur={formik.handleBlur}
												value={formik.values.email}
												name="email"
												id="email"
											/>
										</div>
										{formik.errors.email && formik.touched.email && (
											<div className="text-red-700 mt-1 text-sm">{formik.errors.email}</div>
										)}
									</div>
									<div className="col-span-2 md:col-span-1">
										<label htmlFor="password" className="inline-block font-medium text-gray-600 mb-1">
											Password
										</label>
										<div className="relative">
											<input
												type="password"
												placeholder="Enter password"
												className={classNames(
													'rounded-md flex-1 appearance-none border border-gray-300 w-full py-2 px-4 bg-white text-gray-700 placeholder-gray-400 shadow-sm text-base focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent',
													{
														'focus:ring-red-600 border-red-600':
															formik.errors.password && formik.touched.password
													}
												)}
												onChange={formik.handleChange}
												onBlur={formik.handleBlur}
												value={formik.values.password}
												name="password"
												id="password"
											/>
										</div>
										{formik.errors.password && formik.touched.password && (
											<div className="text-red-700 mt-1 text-sm">{formik.errors.password}</div>
										)}
									</div>
									<div className="col-span-2 md:col-span-1">
										<label
											htmlFor="password_confirmation"
											className="inline-block font-medium text-gray-600 mb-1"
										>
											Password confirmation
										</label>
										<div className="relative">
											<input
												type="password"
												placeholder="Enter password confirmation"
												className={classNames(
													'rounded-md flex-1 appearance-none border border-gray-300 w-full py-2 px-4 bg-white text-gray-700 placeholder-gray-400 shadow-sm text-base focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent',
													{
														'focus:ring-red-600 border-red-600':
															formik.errors.password_confirmation &&
															formik.touched.password_confirmation
													}
												)}
												onChange={formik.handleChange}
												onBlur={formik.handleBlur}
												value={formik.values.password_confirmation}
												name="password_confirmation"
												id="password_confirmation"
											/>
										</div>
										{formik.errors.password_confirmation && formik.touched.password_confirmation && (
											<div className="text-red-700 mt-1 text-sm">{formik.errors.password_confirmation}</div>
										)}
									</div>
									<div className="col-span-2 md:col-span-1">
										<label htmlFor="role" className="inline-block font-medium text-gray-600 mb-1">
											Role
										</label>
										<div className="relative">
											<select
												className={classNames(
													'capitalize rounded-md flex-1 appearance-none border border-gray-300 w-full py-2 px-4 bg-white text-gray-700 placeholder-gray-400 shadow-sm text-base focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent',
													{
														'focus:ring-red-600 border-red-600':
															formik.errors.role && formik.touched.role
													}
												)}
												onChange={formik.handleChange}
												onBlur={formik.handleBlur}
												value={formik.values.role}
												name="role"
												id="role"
											>
												{[
													userConstant.USER_ROLE_VIEWER,
													userConstant.USER_ROLE_MODERATOR,
													userConstant.USER_ROLE_ADMIN,
													userConstant.USER_ROLE_OWNER
												].map((role, index) => (
													<option value={role} key={index}>
														{role}
													</option>
												))}
											</select>
										</div>
										{formik.errors.role && formik.touched.role && (
											<div className="text-red-700 mt-1 text-sm">{formik.errors.role}</div>
										)}
									</div>
									<div className="col-span-2 md:col-span-1">
										<label htmlFor="status" className="inline-block font-medium text-gray-600 mb-1">
											Status
										</label>
										<div className="relative">
											<select
												className={classNames(
													'capitalize rounded-md flex-1 appearance-none border border-gray-300 w-full py-2 px-4 bg-white text-gray-700 placeholder-gray-400 shadow-sm text-base focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent',
													{
														'focus:ring-red-600 border-red-600':
															formik.errors.status && formik.touched.status
													}
												)}
												onChange={formik.handleChange}
												onBlur={formik.handleBlur}
												value={formik.values.status}
												name="status"
												id="status"
											>
												{[
													userConstant.USER_STATUS_INACTIVE,
													userConstant.USER_STATUS_ACTIVE,
													userConstant.USER_STATUS_BANNED
												].map((status, index) => (
													<option value={status} key={index}>
														{status}
													</option>
												))}
											</select>
										</div>
										{formik.errors.status && formik.touched.status && (
											<div className="text-red-700 mt-1 text-sm">{formik.errors.status}</div>
										)}
									</div>
									<div className="col-span-2 md:col-span-1">
										<label htmlFor="image" className="inline-block font-medium text-gray-600 mb-1">
											Avatar
										</label>
										<div className="relative">
											<ImageInput
												name="image"
												id="image"
												onChangeCustom={formik.setFieldValue}
												onBlurCustom={formik.setFieldTouched}
												imgUrl={data.avatar_url}
											/>
										</div>
										{formik.errors.image && formik.touched.image && (
											<div className="text-red-700 mt-1 text-sm">{formik.errors.image}</div>
										)}
									</div>
									<div className="col-span-2">
										<button
											type="submit"
											className={classNames(
												'flex items-center justify-center py-3 px-4 bg-purple-600 hover:bg-purple-700 focus:ring-purple-500 focus:ring-offset-purple-200 text-white transition ease-in duration-200 text-sm font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-md',
												{
													'cursor-not-allowed disabled:opacity-50': isUploading || isUpdating
												}
											)}
											disabled={isUploading || isUpdating}
										>
											{isUploading ? (
												<>
													<AiOutlineLoading3Quarters className="animate-spin h-4 w-4 mr-2 font-medium" />
													<span>Uploading</span>
												</>
											) : isUpdating ? (
												<>
													<AiOutlineLoading3Quarters className="animate-spin h-4 w-4 mr-2 font-medium" />
													<span>Updating</span>
												</>
											) : (
												<span>Submit</span>
											)}
										</button>
									</div>
								</div>
							</form>
						)}
					</CardComponent>
				</div>
			</div>
		</>
	);
};

export default EditPostComponent;
