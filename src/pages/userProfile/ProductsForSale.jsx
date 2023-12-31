import React, { useEffect, useState } from 'react';
import {
	WrapAll,
	Title,
	Scroll,
	ProductsContainer,
	ProductList,
	ProductImg,
	ProductName,
	ProductPrice,
	SortedButton,
} from './productsForSale.style';
import axios from 'axios';
import { API_URL } from '../../api.js';
import {
	CheckButtonWrap,
	CheckLogout,
	CheckModalWrap,
	CheckMsg,
	DarkBackground,
	ModalText,
	ModalWrap,
} from '../../components/modal/modal.style';
import { useNavigate } from 'react-router-dom';

export default function ProductsForSale({ userAccountName }) {
	const [productData, setProductData] = useState([]);
	const [resProd, setResProd] = useState([]);
	const [isModal, setIsModal] = useState(false);
	const [isUserModal, setIsUserModal] = useState(false);
	const [selectedProduct, setSelectedProduct] = useState(null);
	const [myProfile, setMyProfile] = useState();
	const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
	const [selectedButton, setSelectedButton] = useState(0);
	const navigate = useNavigate();
	const accountname = userAccountName;
	const url = API_URL;
	const token = localStorage.getItem('token');
	const data = localStorage.getItem('userAccountName');

	useEffect(() => {
		data && setMyProfile(data);
		async function getProductForSale() {
			const res = await axios({
				method: 'GET',
				url: `${url}/product/${accountname}/?limit=infinity`,
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-type': 'application/json',
				},
			});
			setResProd(res.data.product);
		}
		if (data) {
			getProductForSale();
		}
	}, [data]);

	const handleModalOpen = (item) => {
		if (data === myProfile) {
			setIsModal(true);
			setIsUserModal(true);
			setSelectedProduct(item);
		} else {
			setIsModal(true);
			setIsUserModal(false);
			setSelectedProduct(item);
		}
	};

	const handleModalClose = () => {
		setIsModal(false);
	};

	const handleConfirmationModalOpen = () => {
		setIsConfirmationModalOpen(true);
	};

	const handleConfirmationModalClose = () => {
		setIsConfirmationModalOpen(false);
	};

	const handleDeleteProduct = async () => {
		if (selectedProduct) {
			setIsConfirmationModalOpen(false);
			try {
				const res = await axios({
					method: 'DELETE',
					url: `${url}/product/${selectedProduct.id}`,
					headers: {
						Authorization: `Bearer ${token}`,
						'Content-type': 'application/json',
					},
				});
				setResProd((prevProducts) =>
					prevProducts.filter((product) => product.id !== selectedProduct.id)
				);
			} catch (error) {
				console.error(error);
			}
		}
	};

	const viewProductOnWebsite = () => {
		const url = `${selectedProduct.link}`;
		window.open(url, '_blank');
	};
	const goToProductEdit = () => {
		navigate('/product/edit', {
			state: {
				selectedProduct: selectedProduct,
			},
		});
	};

	const createProductList = (items) => {
		return items.map((item) => (
			<ProductList
				key={item.id}
				onClick={() => {
					handleModalOpen(item);
				}}
			>
				<ProductImg
					src={item.itemImage}
					alt={`${item.itemName}의 상품 이미지`}
				/>
				<ProductName>{item.itemName}</ProductName>
				<ProductPrice>{item.price.toLocaleString()}원</ProductPrice>
			</ProductList>
		));
	};

	useEffect(() => {
		if (resProd.length !== 0) {
			const product = createProductList(resProd);
			setProductData(product);
		}
	}, [resProd]);

	const handleShowAllProducts = () => {
		const products = createProductList(resProd);
		setProductData(products);
	};

	const handleShowRecommendedItems = () => {
		const recommendedProducts = resProd.filter((item) =>
			item.itemName.includes('[추천]')
		);
		const products = createProductList(recommendedProducts);
		setProductData(products);
	};

	const handleShowDiscountedItems = () => {
		const discountedProducts = resProd.filter((item) =>
			item.itemName.includes('[할인]')
		);
		const products = createProductList(discountedProducts);
		setProductData(products);
	};

	return (
		<>
			{resProd.length === 0 ? null : (
				<WrapAll>
					<Title>함께 떠나는 상품</Title>
					<SortedButton
						first
						onClick={() => {
							setSelectedButton(0);
							handleShowAllProducts();
						}}
						selected={selectedButton === 0}
					>
						# 전체 상품
					</SortedButton>
					<SortedButton
						onClick={() => {
							setSelectedButton(1);
							handleShowRecommendedItems();
						}}
						selected={selectedButton === 1}
					>
						🔥추천 상품
					</SortedButton>
					<SortedButton
						onClick={() => {
							setSelectedButton(2);
							handleShowDiscountedItems();
						}}
						selected={selectedButton === 2}
					>
						🤑할인 상품
					</SortedButton>
					<Scroll>
						<ProductsContainer>{productData}</ProductsContainer>
					</Scroll>
				</WrapAll>
			)}
			{isModal && (
				<DarkBackground onClick={handleModalClose}>
					<ModalWrap>
						{isUserModal && (
							<>
								<ModalText onClick={handleConfirmationModalOpen}>
									삭제
								</ModalText>
								<ModalText onClick={goToProductEdit}>수정</ModalText>
							</>
						)}
						<ModalText onClick={viewProductOnWebsite}>
							웹사이트에서 상품 보기
						</ModalText>
					</ModalWrap>
				</DarkBackground>
			)}
			{isConfirmationModalOpen && (
				<DarkBackground onClick={handleModalClose}>
					<CheckModalWrap>
						<CheckMsg>삭제하시겠어요?</CheckMsg>
						<CheckButtonWrap>
							<CheckLogout onClick={handleConfirmationModalClose}>
								취소
							</CheckLogout>
							<CheckLogout check onClick={handleDeleteProduct}>
								삭제
							</CheckLogout>
						</CheckButtonWrap>
					</CheckModalWrap>
				</DarkBackground>
			)}
		</>
	);
}
