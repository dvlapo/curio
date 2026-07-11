import { ArrowRightIcon } from '@heroicons/react/24/outline';
import type { CategoryView } from '../types';
import { ImageWithFallback } from './ImageWithFallback';

interface CategoriesProps {
  categories: CategoryView[];
  onChoose: (category: CategoryView) => void;
}

export function Categories({ categories, onChoose }: CategoriesProps) {
  const shown = categories.slice(0, 6);

  return (
    <section
      id="categories"
      className="categories page-section"
      aria-labelledby="categories-title"
    >
      <div className="section-heading section-reveal">
        <div>
          <h2 id="categories-title">
            A calmer way
            <br />
            to find what matters.
          </h2>
        </div>
        <p>
          Curio keeps the breadth of a marketplace, then edits the noise down to
          pieces that feel useful, beautiful, and easy to choose.
        </p>
      </div>
      <div className="category-grid">
        {shown.map((category, index) => (
          <button
            key={category.id}
            className={`category-card category-${index + 1} pressable section-reveal`}
            onClick={() => onChoose(category)}
          >
            <div className="category-copy">
              <h3>{category.name}</h3>
              <p>{category.description}</p>
              <div className="explore-label">
                Explore department <ArrowRightIcon aria-hidden="true" />
              </div>
            </div>
            <ImageWithFallback
              src={category.image}
              alt={`Explore ${category.name}`}
            />
          </button>
        ))}
      </div>
    </section>
  );
}
