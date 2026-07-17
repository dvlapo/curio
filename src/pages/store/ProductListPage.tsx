import { useEffect, useMemo, useRef } from 'react';
import { Form, Formik, useFormikContext } from 'formik';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import {
  productFilterSchema,
  type ProductFilterValues,
} from '../../../validations';
import { useCart } from '../../cart/CartContext';
import {
  SelectField,
  TextField,
} from '../../components/forms/FormFields';
import { ImageWithFallback } from '../../components/ImageWithFallback';
import { Button } from '../../components/ui/button';
import {
  useCategoriesQuery,
  useProductsQuery,
} from '../../hooks/queries';
import type { Product } from '../../types';
import { getErrorMessage } from '../../utils/errors';
import { formatMoney } from '../../utils/money';
import { PageIntro } from './components/PageIntro';

function ProductTile({ product }: { product: Product }) {
  const navigate = useNavigate();
  const { addProduct } = useCart();
  const stock = product.inventory?.quantity;

  const add = () => {
    addProduct(product);
    toast.success('Added to cart', {
      description: product.name,
      action: { label: 'View cart', onClick: () => navigate('/cart') },
    });
  };

  return (
    <article className="commerce-card">
      <Link to={`/products/${product.id}`} className="commerce-image">
        <ImageWithFallback src={product.images?.[0] ?? ''} alt={product.name} />
      </Link>
      <div className="commerce-meta">
        <span>{product.category?.name ?? 'Marketplace'}</span>
        {product.vendor && (
          <Link to={`/products?vendorId=${product.vendor.id}`}>
            {product.vendor.storeName}
          </Link>
        )}
        {product._count?.reviews !== undefined && (
          <span>{product._count.reviews} reviews</span>
        )}
      </div>
      <h2>
        <Link to={`/products/${product.id}`}>{product.name}</Link>
      </h2>
      <p>{product.description ?? 'A Curio marketplace find.'}</p>
      <div className="commerce-bottom">
        <strong>{formatMoney(product.price)}</strong>
        <Button
          variant="outline"
          size="sm"
          onClick={add}
          disabled={stock === 0}
        >
          {stock === 0 ? 'Out of stock' : 'Add to cart'}
        </Button>
      </div>
    </article>
  );
}

function productFilterParams(values: ProductFilterValues) {
  const next = new URLSearchParams();
  Object.entries(values).forEach(([key, value]) => {
    const clean = String(value ?? '').trim();
    if (clean) next.set(key, clean);
  });
  next.set('page', '1');
  return next;
}

function DebouncedProductSearch({
  setParams,
}: {
  setParams: ReturnType<typeof useSearchParams>[1];
}) {
  const { values } = useFormikContext<ProductFilterValues>();
  const mounted = useRef(false);
  const valuesRef = useRef(values);

  useEffect(() => {
    valuesRef.current = values;
  }, [values]);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return undefined;
    }

    const timeout = window.setTimeout(() => {
      setParams(productFilterParams(valuesRef.current));
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [setParams, values.search]);

  return null;
}

export function ProductListPage() {
  const [params, setParams] = useSearchParams();
  const page = Number(params.get('page') ?? 1);
  const search = params.get('search') ?? '';
  const categoryId = params.get('categoryId') ?? undefined;
  const vendorId = params.get('vendorId') ?? undefined;
  const minPriceParam = params.get('minPrice') ?? '';
  const maxPriceParam = params.get('maxPrice') ?? '';
  const minPrice = minPriceParam ? Number(minPriceParam) : undefined;
  const maxPrice = maxPriceParam ? Number(maxPriceParam) : undefined;

  const categories = useCategoriesQuery();
  const products = useProductsQuery({
    page,
    limit: 12,
    search,
    categoryId,
    vendorId,
    minPrice,
    maxPrice,
  });

  const initialFilters = useMemo<ProductFilterValues>(
    () => ({
      search,
      categoryId: categoryId ?? '',
      vendorId: vendorId ?? '',
      minPrice: minPriceParam,
      maxPrice: maxPriceParam,
    }),
    [categoryId, maxPriceParam, minPriceParam, search, vendorId],
  );

  const meta = products.data?.meta;

  return (
    <main className="page-shell">
      <PageIntro
        title="Products"
        body="Search the live catalog, narrow by department, and add available products to your local cart."
      />
      <Formik<ProductFilterValues>
        enableReinitialize
        initialValues={initialFilters}
        validationSchema={productFilterSchema}
        onSubmit={(values) => setParams(productFilterParams(values))}
      >
        <Form className="filter-panel" noValidate>
          <DebouncedProductSearch setParams={setParams} />
          <TextField
            name="search"
            label="Search"
            placeholder="Sneakers, lamp, serum"
          />
          <input
            type="hidden"
            name="vendorId"
            value={vendorId ?? ''}
            readOnly
          />
          <SelectField name="categoryId" label="Department">
            <option value="">All departments</option>
            {categories.data?.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </SelectField>
          <TextField name="minPrice" label="Min price" type="number" min="0" />
          <TextField name="maxPrice" label="Max price" type="number" min="0" />
          <Button type="submit" className="self-end">
            Apply filters
          </Button>
        </Form>
      </Formik>
      {vendorId && (
        <div className="filter-chip-row">
          <span>Vendor filter active: {vendorId.slice(0, 8)}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setParams((current) => {
                current.delete('vendorId');
                current.set('page', '1');
                return current;
              })
            }
          >
            Clear vendor
          </Button>
        </div>
      )}

      {products.isLoading && (
        <div className="route-state">Loading products...</div>
      )}
      {products.error && (
        <div className="form-error">
          {getErrorMessage(products.error, 'Could not load products')}
        </div>
      )}
      {products.data?.data.length === 0 && (
        <div className="empty-panel">
          <h2>No products found.</h2>
          <p>Try a broader search or clear the filters.</p>
        </div>
      )}
      <div className="commerce-grid">
        {products.data?.data.map((product) => (
          <ProductTile key={product.id} product={product} />
        ))}
      </div>
      {meta && meta.totalPages > 1 && (
        <div className="pagination">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() =>
              setParams((current) => {
                current.set('page', String(page - 1));
                return current;
              })
            }
          >
            Previous
          </Button>
          <span>
            Page {meta.page} of {meta.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= meta.totalPages}
            onClick={() =>
              setParams((current) => {
                current.set('page', String(page + 1));
                return current;
              })
            }
          >
            Next
          </Button>
        </div>
      )}
    </main>
  );
}
