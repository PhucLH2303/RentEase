import React from 'react';

interface Post {
  postId: string;
  postCategoryId: number;
  posterId: string;
  aptId: string;
  title: string;
  rentPrice: number;
  pilePrice: number | null;
  totalSlot: number;
  currentSlot: number;
  genderId: number;
  oldId: number;
  note: string;
  moveInDate: string;
  moveOutDate: string;
  startPublic: string;
  endPublic: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  status: boolean;
}

interface GridProps {
  posts: Post[];
}

const Grid: React.FC<GridProps> = ({ posts }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {posts.length === 0 ? (
        <p className="text-center col-span-full text-gray-500">No posts available.</p>
      ) : (
        posts.map((post) => (
          <div
            key={post.postId}
            className="bg-white shadow-lg rounded-xl p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300"
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-3 capitalize">{post.title}</h2>
            <div className="space-y-2 text-gray-600">
              <p>
                <span className="font-medium">Apartment ID:</span> {post.aptId}
              </p>
              <p>
                <span className="font-medium">Rent Price:</span> ${post.rentPrice.toLocaleString()}
              </p>
              <p>
                <span className="font-medium">Slots:</span> {post.currentSlot}/{post.totalSlot}
              </p>
              <p>
                <span className="font-medium">Move-in Date:</span>{' '}
                {new Date(post.moveInDate).toLocaleDateString()}
              </p>
              <p>
                <span className="font-medium">Move-out Date:</span>{' '}
                {new Date(post.moveOutDate).toLocaleDateString()}
              </p>
              <p>
                <span className="font-medium">Note:</span> {post.note}
              </p>
              <p>
                <span className="font-medium">Published:</span>{' '}
                {new Date(post.startPublic).toLocaleDateString()}
              </p>
            </div>
            <div className="mt-4">
              <span
                className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${post.status ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}
              >
                {post.status ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default Grid;