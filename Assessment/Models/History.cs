﻿using Assessment.Models.AccountViewModels;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Assessment.Models
{
    public class History
    {
		/// <summary>
		/// List of Queries the user entered
		/// </summary>
		public List<QueryViewModel> QueryList { get; set; }
    }
}
