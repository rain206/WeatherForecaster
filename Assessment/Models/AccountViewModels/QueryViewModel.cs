using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Assessment.Models.AccountViewModels
{
    public class QueryViewModel
    {
		/// <summary>
		/// Query Id
		/// </summary>
		public int Id { get; set; }

		/// <summary>
		/// The search query
		/// </summary>
		public string Query { get; set; }

		/// <summary>
		/// The ID (email) of the user that made the Query
		/// </summary>
		public string UserId { get; set; }
    }
}
